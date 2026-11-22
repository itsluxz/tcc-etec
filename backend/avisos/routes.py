from fastapi import HTTPException, APIRouter
from pydantic import BaseModel, Field
from postgrest.exceptions import APIError
from database import supabase

router = APIRouter(tags=["avisos"])

class AvisoEntrada(BaseModel):
    titulo: str = Field(min_length=1, max_length=200)
    descricao: str = Field(min_length=1)
    autor_id: int | None = None

class AvisoAtualizacao(BaseModel):
    titulo: str | None = Field(default=None, min_length=1, max_length=200)
    descricao: str | None = Field(default=None, min_length=1)
    autor_id: int | None = None
    ativo: bool | None = None


@router.get("/avisos", status_code=200)
def listar_avisos():
    try:
        resposta = supabase.table("avisos").select("*").execute()

        return resposta.data

    except APIError:
        raise HTTPException(status_code=500, detail="Erro ao consultar no banco de dados")


@router.get("/avisos/{aviso_id}", status_code=200)
def buscar_aviso(aviso_id: int):
    try:
        resposta = supabase.table("avisos").select("*").eq("id", aviso_id).execute()

    except APIError:
        raise HTTPException(status_code=500, detail="Erro ao consultar no banco de dados")

    if not resposta.data:
        raise HTTPException(status_code=404, detail="Aviso não encontrado")

    return resposta.data[0]


@router.post("/avisos", status_code=201)
def criar_aviso(dados: AvisoEntrada):
    try:
        resposta = supabase.table("avisos").insert(dados.model_dump()).execute()

        return {
            "mensagem": "Aviso criado com sucesso",
            **resposta.data[0],
        }

    except APIError as erro:
        raise HTTPException(status_code=400, detail=f"Não foi possível cadastrar o aviso: {erro.message}")


@router.put("/avisos/{aviso_id}", status_code=200)
def atualizar_aviso(aviso_id: int, dados: AvisoAtualizacao):
    alteracoes = dados.model_dump(exclude_none=True)
    if not alteracoes:
        raise HTTPException(status_code=400, detail="Nenhum campo para atualizar")

    try:
        resposta = supabase.table("avisos").update(alteracoes).eq("id", aviso_id).execute()

    except APIError as erro:
        raise HTTPException(status_code=500, detail=f"Erro ao salvar no banco de dados: {erro.message}")

    if not resposta.data:
        raise HTTPException(status_code=404, detail="Aviso não encontrado")

    return {
        "mensagem": "Aviso atualizado com sucesso",
        **resposta.data[0],
    }


@router.delete("/avisos/{aviso_id}", status_code=204)
def deletar_aviso(aviso_id: int):
    try:
        resposta = supabase.table("avisos").delete().eq("id", aviso_id).execute()

    except APIError as erro:
        raise HTTPException(status_code=500, detail=f"Erro ao salvar no banco de dados: {erro.message}")

    if not resposta.data:
        raise HTTPException(status_code=404, detail="Não foi possível encontrar o aviso")
