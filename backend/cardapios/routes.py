from datetime import date

from fastapi import HTTPException, APIRouter
from pydantic import BaseModel, Field
from postgrest.exceptions import APIError
from database import supabase

router = APIRouter(tags=["cardapios"])

class CardapioEntrada(BaseModel):
    data: date
    titulo: str | None = Field(default=None, min_length=1, max_length=50)
    descricao: str = Field(min_length=1)

class CardapioAtualizacao(BaseModel):
    data: date | None = None
    titulo: str | None = Field(default=None, min_length=1, max_length=50)
    descricao: str | None = Field(default=None, min_length=1)


@router.get("/cardapios", status_code=200)
def listar_cardapios():
    try:
        resposta = supabase.table("cardapios").select("*").execute()

        return resposta.data

    except APIError:
        raise HTTPException(status_code=500, detail="Erro ao consultar no banco de dados")


@router.get("/cardapios/{cardapio_id}", status_code=200)
def buscar_cardapio(cardapio_id: int):
    try:
        resposta = supabase.table("cardapios").select("*").eq("id", cardapio_id).execute()

    except APIError:
        raise HTTPException(status_code=500, detail="Erro ao consultar no banco de dados")

    if not resposta.data:
        raise HTTPException(status_code=404, detail="Cardápio não encontrado")

    return resposta.data[0]


@router.post("/cardapios", status_code=201)
def criar_cardapio(dados: CardapioEntrada):
    # mode="json" converte a data para texto, formato aceito pelo supabase
    novo = dados.model_dump(mode="json")

    try:
        resposta = supabase.table("cardapios").insert(novo).execute()

        return {
            "mensagem": "Cardápio criado com sucesso",
            **resposta.data[0],
        }

    except APIError as erro:
        raise HTTPException(status_code=400, detail=f"Não foi possível cadastrar o cardápio: {erro.message}")


@router.put("/cardapios/{cardapio_id}", status_code=200)
def atualizar_cardapio(cardapio_id: int, dados: CardapioAtualizacao):
    alteracoes = dados.model_dump(mode="json", exclude_none=True)
    if not alteracoes:
        raise HTTPException(status_code=400, detail="Nenhum campo para atualizar")

    try:
        resposta = supabase.table("cardapios").update(alteracoes).eq("id", cardapio_id).execute()

    except APIError as erro:
        raise HTTPException(status_code=500, detail=f"Erro ao salvar no banco de dados: {erro.message}")

    if not resposta.data:
        raise HTTPException(status_code=404, detail="Cardápio não encontrado")

    return {
        "mensagem": "Cardápio atualizado com sucesso",
        **resposta.data[0],
    }


@router.delete("/cardapios/{cardapio_id}", status_code=204)
def deletar_cardapio(cardapio_id: int):
    try:
        resposta = supabase.table("cardapios").delete().eq("id", cardapio_id).execute()

    except APIError as erro:
        raise HTTPException(status_code=500, detail=f"Erro ao salvar no banco de dados: {erro.message}")

    if not resposta.data:
        raise HTTPException(status_code=404, detail="Não foi possível encontrar o cardápio")
