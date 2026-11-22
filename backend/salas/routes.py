from fastapi import HTTPException, APIRouter
from pydantic import BaseModel, Field
from postgrest.exceptions import APIError
from database import supabase

router = APIRouter(tags=["salas"])

# limites iguais aos das colunas da tabela salas
class SalaEntrada(BaseModel):
    nome: str = Field(min_length=1, max_length=100)
    tipo: str = Field(min_length=1, max_length=50)
    disponivel: bool = True

class SalaAtualizacao(BaseModel):
    nome: str | None = Field(default=None, min_length=1, max_length=100)
    tipo: str | None = Field(default=None, min_length=1, max_length=50)
    disponivel: bool | None = None


@router.get("/salas", status_code=200)
def listar_salas():
    try:
        # por id (ordem de cadastro): por nome ficaria "Sala 1, Sala 10, Sala 2..."
        resposta = supabase.table("salas").select("*").order("id").execute()

        return resposta.data

    except APIError:
        raise HTTPException(status_code=500, detail="Erro ao consultar no banco de dados")


@router.get("/salas/{sala_id}", status_code=200)
def buscar_sala(sala_id: int):
    try:
        resposta = supabase.table("salas").select("*").eq("id", sala_id).execute()

    except APIError:
        raise HTTPException(status_code=500, detail="Erro ao consultar no banco de dados")

    if not resposta.data:
        raise HTTPException(status_code=404, detail="Sala não encontrada")

    return resposta.data[0]


@router.post("/salas", status_code=201)
def criar_sala(dados: SalaEntrada):
    try:
        resposta = supabase.table("salas").insert(dados.model_dump()).execute()

        return {
            "mensagem": "Sala criada com sucesso",
            **resposta.data[0],
        }

    except APIError as erro:
        raise HTTPException(status_code=400, detail=f"Não foi possível cadastrar a sala: {erro.message}")


@router.put("/salas/{sala_id}", status_code=200)
def atualizar_sala(sala_id: int, dados: SalaAtualizacao):
    alteracoes = dados.model_dump(exclude_none=True)
    if not alteracoes:
        raise HTTPException(status_code=400, detail="Nenhum campo para atualizar")

    try:
        resposta = supabase.table("salas").update(alteracoes).eq("id", sala_id).execute()

    except APIError as erro:
        raise HTTPException(status_code=500, detail=f"Erro ao salvar no banco de dados: {erro.message}")

    if not resposta.data:
        raise HTTPException(status_code=404, detail="Sala não encontrada")

    return {
        "mensagem": "Sala atualizada com sucesso",
        **resposta.data[0],
    }


@router.delete("/salas/{sala_id}", status_code=204)
def deletar_sala(sala_id: int):
    try:
        resposta = supabase.table("salas").delete().eq("id", sala_id).execute()

    except APIError as erro:
        # a sala não pode ser apagada enquanto tiver reservas
        raise HTTPException(status_code=500, detail=f"Erro ao salvar no banco de dados: {erro.message}")

    if not resposta.data:
        raise HTTPException(status_code=404, detail="Não foi possível encontrar a sala")
