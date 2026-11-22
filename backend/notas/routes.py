from typing import Literal
from fastapi import HTTPException, APIRouter
from pydantic import BaseModel, Field
from postgrest.exceptions import APIError
from database import supabase

router = APIRouter(tags=["notas"])

#Notas Padrão ETEC, da menor para a maior
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
    mencao_trabalho: Mencao
    mencao_atividades: Mencao
    mencao_prova: Mencao
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


# menção final = média das três: cada menção vira um número (I=1, R=2, B=3, MB=4),
# tira a média, arredonda e volta para menção
def calcular_mencao_final(nota):
    valores = [
        MENCOES.index(nota["mencao_trabalho"]) + 1,
        MENCOES.index(nota["mencao_atividades"]) + 1,
        MENCOES.index(nota["mencao_prova"]) + 1,
    ]
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


@router.post("/notas", status_code=201)
def criar_nota(dados: NotaEntrada):
    if not usuario_tem_tipo(dados.aluno_id, ["ALUNO"]):
        raise HTTPException(status_code=400, detail="Aluno não encontrado")

    # Permissao apenas para professor e gestor
    if not usuario_tem_tipo(dados.professor_id, ["PROFESSOR", "GESTAO"]):
        raise HTTPException(status_code=400, detail="Apenas professores e gestores podem lançar notas")

    # professor só lança nota das disciplinas que dá aula; gestão pode lançar de qualquer uma
    if usuario_tem_tipo(dados.professor_id, ["PROFESSOR"]) and not professor_da_aula(dados.professor_id, dados.disciplina_id):
        raise HTTPException(status_code=400, detail="Esse professor não dá aula dessa disciplina")

    try:
        resposta = supabase.table("notas").insert(dados.model_dump()).execute()

        return {
            "mensagem": "Nota lançada com sucesso",
            **nota_com_final(resposta.data[0]),
        }

    except APIError as erro:
        # o banco recusa uma segunda nota do mesmo aluno, na mesma disciplina e bimestre
        if "notas_aluno_id_disciplina_id_bimestre_key" in (erro.message or ""):
            raise HTTPException(status_code=409, detail="Esse aluno já tem nota nessa disciplina e bimestre")
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
