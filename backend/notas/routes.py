from typing import Literal
from fastapi import HTTPException, APIRouter, Response
from pydantic import BaseModel, Field
from postgrest.exceptions import APIError
from database import supabase

router = APIRouter(tags=["notas"])

#Notas Padrão ETEC
Mencao = Literal["I", "R", "B", "MB"]
MENCOES = ["I", "R", "B", "MB"]

#Nome do aluno, a turma e a disciplina junto com a nota
CAMPOS = "*, aluno:usuarios!aluno_id(nome), turma:turmas(nome, ano), disciplina:disciplinas(nome)"

class NotaEntrada(BaseModel):
    aluno_id: int
    professor_id: int
    turma_id: int
    disciplina_id: int
    bimestre: int = Field(ge=1, le=4)
    # dá para lançar uma menção por vez: as que faltarem são lançadas depois
    mencao_trabalho: Mencao | None = None
    mencao_atividades: Mencao | None = None
    mencao_prova: Mencao | None = None
    observacao: str | None = Field(default=None, min_length=1)

class NotaAtualizacao(BaseModel):
    aluno_id: int | None = None
    professor_id: int | None = None
    turma_id: int | None = None
    disciplina_id: int | None = None
    bimestre: int | None = Field(default=None, ge=1, le=4)
    mencao_trabalho: Mencao | None = None
    mencao_atividades: Mencao | None = None
    mencao_prova: Mencao | None = None
    observacao: str | None = Field(default=None, min_length=1)


CAMPOS_MENCAO = ["mencao_trabalho", "mencao_atividades", "mencao_prova"]


# menção final = média das três: cada menção vira um número (I=1, R=2, B=3, MB=4),
# tira a média, arredonda e volta para menção
# enquanto faltar alguma das três, a final fica vazia (None)
def calcular_mencao_final(nota):
    if any(not nota.get(campo) for campo in CAMPOS_MENCAO):
        return None

    valores = [MENCOES.index(nota[campo]) + 1 for campo in CAMPOS_MENCAO]
    media = sum(valores) / 3
    return MENCOES[round(media) - 1]


# devolve a nota com a menção final junto
def nota_com_final(linha):
    return {**linha, "mencao_final": calcular_mencao_final(linha)}


def usuario_tem_tipo(usuario_id, tipos):
    try:
        resposta = supabase.table("usuarios").select("id").eq("id", usuario_id).in_("tipo", tipos).execute()

    except APIError:
        raise HTTPException(status_code=500, detail="Erro ao consultar no banco de dados")

    return bool(resposta.data)


NOMES_MENCAO = {"mencao_trabalho": "trabalho", "mencao_atividades": "atividades", "mencao_prova": "prova"}


# a nota do aluno naquela disciplina e bimestre (só pode existir uma)
def buscar_nota_do_bimestre(aluno_id, disciplina_id, bimestre):
    try:
        resposta = (
            supabase.table("notas")
            .select("*")
            .eq("aluno_id", aluno_id)
            .eq("disciplina_id", disciplina_id)
            .eq("bimestre", bimestre)
            .execute()
        )

    except APIError:
        raise HTTPException(status_code=500, detail="Erro ao consultar no banco de dados")

    return resposta.data[0] if resposta.data else None


def professor_da_aula(professor_id, disciplina_id):
    try:
        resposta = (
            supabase.table("professor_disciplinas")
            .select("professor_id")
            .eq("professor_id", professor_id)
            .eq("disciplina_id", disciplina_id)
            .execute()
        )

    except APIError:
        raise HTTPException(status_code=500, detail="Erro ao consultar no banco de dados")

    return bool(resposta.data)


@router.get("/notas", status_code=200)
def listar_notas(aluno_id: int | None = None, professor_id: int | None = None, turma_id: int | None = None, bimestre: int | None = None):
    try:

        consulta = supabase.table("notas").select(CAMPOS)
        if aluno_id:
            consulta = consulta.eq("aluno_id", aluno_id)
        if professor_id:
            consulta = consulta.eq("professor_id", professor_id)
        if turma_id:
            consulta = consulta.eq("turma_id", turma_id)
        if bimestre:
            consulta = consulta.eq("bimestre", bimestre)
        resposta = consulta.execute()

        return [nota_com_final(linha) for linha in resposta.data]

    except APIError:
        raise HTTPException(status_code=500, detail="Erro ao consultar no banco de dados")


@router.get("/notas/{nota_id}", status_code=200)
def buscar_nota(nota_id: int):
    try:
        resposta = supabase.table("notas").select(CAMPOS).eq("id", nota_id).execute()

    except APIError:
        raise HTTPException(status_code=500, detail="Erro ao consultar no banco de dados")

    if not resposta.data:
        raise HTTPException(status_code=404, detail="Nota não encontrada")

    return nota_com_final(resposta.data[0])


# lança menções: se o aluno ainda não tem nota nessa disciplina e bimestre, cria;
# se já tem, completa só as menções que ainda estavam vazias
@router.post("/notas", status_code=201)
def criar_nota(dados: NotaEntrada, response: Response):
    novas_mencoes = {campo: valor for campo, valor in dados.model_dump().items() if campo in CAMPOS_MENCAO and valor}
    if not novas_mencoes:
        raise HTTPException(status_code=400, detail="Escolha pelo menos uma menção")

    if not usuario_tem_tipo(dados.aluno_id, ["ALUNO"]):
        raise HTTPException(status_code=400, detail="Aluno não encontrado")

    # Permissao apenas para professor e gestor
    if not usuario_tem_tipo(dados.professor_id, ["PROFESSOR", "GESTAO"]):
        raise HTTPException(status_code=400, detail="Apenas professores e gestores podem lançar notas")

    # professor só lança nota das disciplinas que dá aula; gestão pode lançar de qualquer uma
    if usuario_tem_tipo(dados.professor_id, ["PROFESSOR"]) and not professor_da_aula(dados.professor_id, dados.disciplina_id):
        raise HTTPException(status_code=400, detail="Esse professor não dá aula dessa disciplina")

    existente = buscar_nota_do_bimestre(dados.aluno_id, dados.disciplina_id, dados.bimestre)

    if existente:
        # não sobrescreve menção já lançada; para trocar, use o Editar (PUT /notas/{id})
        ja_lancadas = [campo for campo in novas_mencoes if existente.get(campo)]
        if ja_lancadas:
            nomes = ", ".join(NOMES_MENCAO[campo] for campo in ja_lancadas)
            raise HTTPException(status_code=409, detail=f"Esse aluno já tem menção de {nomes} nesse bimestre")

        try:
            resposta = supabase.table("notas").update(novas_mencoes).eq("id", existente["id"]).execute()

        except APIError as erro:
            raise HTTPException(status_code=500, detail=f"Erro ao salvar no banco de dados: {erro.message}")

        response.status_code = 200
        return {
            "mensagem": "Menção adicionada à nota",
            **nota_com_final(resposta.data[0]),
        }

    try:
        resposta = supabase.table("notas").insert(dados.model_dump(exclude_none=True)).execute()

        return {
            "mensagem": "Nota lançada com sucesso",
            **nota_com_final(resposta.data[0]),
        }

    except APIError as erro:
        raise HTTPException(status_code=400, detail=f"Não foi possível lançar a nota: {erro.message}")


@router.put("/notas/{nota_id}", status_code=200)
def atualizar_nota(nota_id: int, dados: NotaAtualizacao):
    alteracoes = dados.model_dump(exclude_none=True)
    if not alteracoes:
        raise HTTPException(status_code=400, detail="Nenhum campo para atualizar")

    try:
        resposta = supabase.table("notas").update(alteracoes).eq("id", nota_id).execute()

    except APIError as erro:
        raise HTTPException(status_code=500, detail=f"Erro ao salvar no banco de dados: {erro.message}")

    if not resposta.data:
        raise HTTPException(status_code=404, detail="Nota não encontrada")

    return {
        "mensagem": "Nota atualizada com sucesso",
        **nota_com_final(resposta.data[0]),
    }


@router.delete("/notas/{nota_id}", status_code=204)
def deletar_nota(nota_id: int):
    try:
        resposta = supabase.table("notas").delete().eq("id", nota_id).execute()

    except APIError as erro:
        raise HTTPException(status_code=500, detail=f"Erro ao salvar no banco de dados: {erro.message}")

    if not resposta.data:
        raise HTTPException(status_code=404, detail="Não foi possível encontrar a nota")
