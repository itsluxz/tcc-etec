from fastapi import HTTPException, APIRouter
from pydantic import BaseModel, Field
from postgrest.exceptions import APIError
from database import supabase

router = APIRouter(tags=["ocorrencias"])

class OcorrenciaEntrada(BaseModel):
    usuario_id: int | None = None
    local: str | None = Field(default=None, min_length=1, max_length=150)
    titulo: str | None = Field(default=None, min_length=1, max_length=200)
    descricao: str | None = Field(default=None, min_length=1)
    prioridade: str | None = Field(default=None, min_length=1, max_length=30)

class OcorrenciaAtualizacao(BaseModel):
    usuario_id: int | None = None
    local: str | None = Field(default=None, min_length=1, max_length=150)
    titulo: str | None = Field(default=None, min_length=1, max_length=200)
    descricao: str | None = Field(default=None, min_length=1)
    prioridade: str | None = Field(default=None, min_length=1, max_length=30)
    status: str | None = Field(default=None, min_length=1, max_length=30)


@router.get("/ocorrencias", status_code=200)
def listar_ocorrencias():
    try:
        resposta = supabase.table("ocorrencias").select("*").execute()

        return resposta.data

    except APIError:
        raise HTTPException(status_code=500, detail="Erro ao consultar no banco de dados")


@router.get("/ocorrencias/{ocorrencia_id}", status_code=200)
def buscar_ocorrencia(ocorrencia_id: int):
    try:
        resposta = supabase.table("ocorrencias").select("*").eq("id", ocorrencia_id).execute()

    except APIError:
        raise HTTPException(status_code=500, detail="Erro ao consultar no banco de dados")

    if not resposta.data:
        raise HTTPException(status_code=404, detail="Ocorrência não encontrada")

    return resposta.data[0]


@router.post("/ocorrencias", status_code=201)
def criar_ocorrencia(dados: OcorrenciaEntrada):
    try:
        resposta = supabase.table("ocorrencias").insert(dados.model_dump()).execute()

        return {
            "mensagem": "Ocorrência criada com sucesso",
            **resposta.data[0],
        }

    except APIError as erro:
        raise HTTPException(status_code=400, detail=f"Não foi possível cadastrar a ocorrência: {erro.message}")


@router.put("/ocorrencias/{ocorrencia_id}", status_code=200)
def atualizar_ocorrencia(ocorrencia_id: int, dados: OcorrenciaAtualizacao):
    alteracoes = dados.model_dump(exclude_none=True)
    if not alteracoes:
        raise HTTPException(status_code=400, detail="Nenhum campo para atualizar")

    try:
        resposta = supabase.table("ocorrencias").update(alteracoes).eq("id", ocorrencia_id).execute()

    except APIError as erro:
        raise HTTPException(status_code=500, detail=f"Erro ao salvar no banco de dados: {erro.message}")

    if not resposta.data:
        raise HTTPException(status_code=404, detail="Ocorrência não encontrada")

    return {
        "mensagem": "Ocorrência atualizada com sucesso",
        **resposta.data[0],
    }


@router.delete("/ocorrencias/{ocorrencia_id}", status_code=204)
def deletar_ocorrencia(ocorrencia_id: int):
    try:
        resposta = supabase.table("ocorrencias").delete().eq("id", ocorrencia_id).execute()

    except APIError as erro:
        raise HTTPException(status_code=500, detail=f"Erro ao salvar no banco de dados: {erro.message}")

    if not resposta.data:
        raise HTTPException(status_code=404, detail="Não foi possível encontrar a ocorrência")
