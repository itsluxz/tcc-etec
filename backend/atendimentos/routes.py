from datetime import datetime, timezone

from fastapi import HTTPException, APIRouter
from pydantic import BaseModel, Field
from postgrest.exceptions import APIError
from database import supabase

router = APIRouter(tags=["atendimentos"])

class AtendimentoEntrada(BaseModel):
    usuario_id: int | None = None
    assunto: str | None = Field(default=None, min_length=1, max_length=200)
    descricao: str = Field(min_length=1)

class AtendimentoAtualizacao(BaseModel):
    usuario_id: int | None = None
    assunto: str | None = Field(default=None, min_length=1, max_length=200)
    descricao: str | None = Field(default=None, min_length=1)
    status: str | None = Field(default=None, min_length=1, max_length=30)
    resposta: str | None = Field(default=None, min_length=1)


@router.get("/atendimentos", status_code=200)
def listar_atendimentos():
    try:
        resposta = supabase.table("atendimentos").select("*").execute()

        return resposta.data

    except APIError:
        raise HTTPException(status_code=500, detail="Erro ao consultar no banco de dados")


@router.get("/atendimentos/{atendimento_id}", status_code=200)
def buscar_atendimento(atendimento_id: int):
    try:
        resposta = supabase.table("atendimentos").select("*").eq("id", atendimento_id).execute()

    except APIError:
        raise HTTPException(status_code=500, detail="Erro ao consultar no banco de dados")

    if not resposta.data:
        raise HTTPException(status_code=404, detail="Atendimento não encontrado")

    return resposta.data[0]


@router.post("/atendimentos", status_code=201)
def criar_atendimento(dados: AtendimentoEntrada):
    try:
        resposta = supabase.table("atendimentos").insert(dados.model_dump()).execute()

        return {
            "mensagem": "Atendimento criado com sucesso",
            **resposta.data[0],
        }

    except APIError as erro:
        raise HTTPException(status_code=400, detail=f"Não foi possível cadastrar o atendimento: {erro.message}")


@router.put("/atendimentos/{atendimento_id}", status_code=200)
def atualizar_atendimento(atendimento_id: int, dados: AtendimentoAtualizacao):
    alteracoes = dados.model_dump(exclude_none=True)
    if not alteracoes:
        raise HTTPException(status_code=400, detail="Nenhum campo para atualizar")

    # a coluna atualizado_em não tem valor padrão no banco
    alteracoes["atualizado_em"] = datetime.now(timezone.utc).isoformat()

    try:
        resposta = supabase.table("atendimentos").update(alteracoes).eq("id", atendimento_id).execute()

    except APIError as erro:
        raise HTTPException(status_code=500, detail=f"Erro ao salvar no banco de dados: {erro.message}")

    if not resposta.data:
        raise HTTPException(status_code=404, detail="Atendimento não encontrado")

    return {
        "mensagem": "Atendimento atualizado com sucesso",
        **resposta.data[0],
    }


@router.delete("/atendimentos/{atendimento_id}", status_code=204)
def deletar_atendimento(atendimento_id: int):
    try:
        resposta = supabase.table("atendimentos").delete().eq("id", atendimento_id).execute()

    except APIError as erro:
        raise HTTPException(status_code=500, detail=f"Erro ao salvar no banco de dados: {erro.message}")

    if not resposta.data:
        raise HTTPException(status_code=404, detail="Não foi possível encontrar o atendimento")
