from typing import Literal
from fastapi import HTTPException, APIRouter
from pydantic import BaseModel, Field
from postgrest.exceptions import APIError
from database import supabase

router = APIRouter(tags=["notas"])

# menções da ETEC, da menor para a maior
Mencao = Literal["I", "R", "B", "MB"]

# traz o nome do aluno junto com a nota
CAMPOS = "*, aluno:usuarios!aluno_id(nome)"

class NotaEntrada(BaseModel):
    aluno_id: int
    professor_id: int
    turma: str = Field(min_length=1, max_length=50)
    disciplina: str = Field(min_length=1, max_length=100)
    bimestre: int = Field(ge=1, le=4)
    mencao: Mencao
    observacao: str | None = Field(default=None, min_length=1)

class NotaAtualizacao(BaseModel):
    aluno_id: int | None = None
    professor_id: int | None = None
    turma: str | None = Field(default=None, min_length=1, max_length=50)
    disciplina: str | None = Field(default=None, min_length=1, max_length=100)
    bimestre: int | None = Field(default=None, ge=1, le=4)
    mencao: Mencao | None = None
    observacao: str | None = Field(default=None, min_length=1)


def usuario_tem_tipo(usuario_id, tipos):
    try:
        resposta = supabase.table("usuarios").select("id").eq("id", usuario_id).in_("tipo", tipos).execute()

    except APIError:
        raise HTTPException(status_code=500, detail="Erro ao consultar no banco de dados")

    return bool(resposta.data)


@router.get("/notas", status_code=200)
def listar_notas(aluno_id: int | None = None, turma: str | None = None, disciplina: str | None = None, bimestre: int | None = None):
    try:
        # filtros opcionais, ex: /notas?aluno_id=3 ou /notas?turma=3A&bimestre=1
        consulta = supabase.table("notas").select(CAMPOS)
        if aluno_id:
            consulta = consulta.eq("aluno_id", aluno_id)
        if turma:
            consulta = consulta.eq("turma", turma)
        if disciplina:
            consulta = consulta.eq("disciplina", disciplina)
        if bimestre:
            consulta = consulta.eq("bimestre", bimestre)
        resposta = consulta.execute()

        return resposta.data

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

    return resposta.data[0]


@router.post("/notas", status_code=201)
def criar_nota(dados: NotaEntrada):
    if not usuario_tem_tipo(dados.aluno_id, ["ALUNO"]):
        raise HTTPException(status_code=400, detail="Aluno não encontrado")

    # só professores e gestores podem lançar notas
    if not usuario_tem_tipo(dados.professor_id, ["PROFESSOR", "GESTAO"]):
        raise HTTPException(status_code=400, detail="Apenas professores e gestores podem lançar notas")

    try:
        resposta = supabase.table("notas").insert(dados.model_dump()).execute()

        return {
            "mensagem": "Nota lançada com sucesso",
            **resposta.data[0],
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
        **resposta.data[0],
    }


@router.delete("/notas/{nota_id}", status_code=204)
def deletar_nota(nota_id: int):
    try:
        resposta = supabase.table("notas").delete().eq("id", nota_id).execute()

    except APIError as erro:
        raise HTTPException(status_code=500, detail=f"Erro ao salvar no banco de dados: {erro.message}")

    if not resposta.data:
        raise HTTPException(status_code=404, detail="Não foi possível encontrar a nota")
