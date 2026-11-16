from fastapi import HTTPException, APIRouter
from pydantic import BaseModel, Field
from postgrest.exceptions import APIError
from database import supabase

router = APIRouter(tags=["turmas"])

class TurmaEntrada(BaseModel):
    nome: str = Field(min_length=1, max_length=50)
    ano: int

class TurmaAtualizacao(BaseModel):
    nome: str | None = Field(default=None, min_length=1, max_length=50)
    ano: int | None = None


@router.get("/turmas", status_code=200)
def listar_turmas():
    try:
        resposta = supabase.table("turmas").select("*").execute()

        return resposta.data

    except APIError:
        raise HTTPException(status_code=500, detail="Erro ao consultar no banco de dados")


@router.get("/turmas/{turma_id}", status_code=200)
def buscar_turma(turma_id: int):
    try:
        resposta = supabase.table("turmas").select("*").eq("id", turma_id).execute()

    except APIError:
        raise HTTPException(status_code=500, detail="Erro ao consultar no banco de dados")

    if not resposta.data:
        raise HTTPException(status_code=404, detail="Turma não encontrada")

    return resposta.data[0]


@router.post("/turmas", status_code=201)
def criar_turma(dados: TurmaEntrada):
    try:
        resposta = supabase.table("turmas").insert(dados.model_dump()).execute()

        return {
            "mensagem": "Turma criada com sucesso",
            **resposta.data[0],
        }

    except APIError as erro:
        raise HTTPException(status_code=400, detail=f"Não foi possível cadastrar a turma: {erro.message}")


@router.put("/turmas/{turma_id}", status_code=200)
def atualizar_turma(turma_id: int, dados: TurmaAtualizacao):
    alteracoes = dados.model_dump(exclude_none=True)
    if not alteracoes:
        raise HTTPException(status_code=400, detail="Nenhum campo para atualizar")

    try:
        resposta = supabase.table("turmas").update(alteracoes).eq("id", turma_id).execute()

    except APIError as erro:
        raise HTTPException(status_code=500, detail=f"Erro ao salvar no banco de dados: {erro.message}")

    if not resposta.data:
        raise HTTPException(status_code=404, detail="Turma não encontrada")

    return {
        "mensagem": "Turma atualizada com sucesso",
        **resposta.data[0],
    }


@router.delete("/turmas/{turma_id}", status_code=204)
def deletar_turma(turma_id: int):
    try:
        resposta = supabase.table("turmas").delete().eq("id", turma_id).execute()

    except APIError as erro:
        # a turma não pode ser apagada enquanto tiver alunos, notas ou substituições ligadas a ela
        raise HTTPException(status_code=500, detail=f"Erro ao salvar no banco de dados: {erro.message}")

    if not resposta.data:
        raise HTTPException(status_code=404, detail="Não foi possível encontrar a turma")
