from datetime import date, time

from fastapi import HTTPException, APIRouter
from pydantic import BaseModel, Field
from postgrest.exceptions import APIError
from database import supabase

router = APIRouter(tags=["reservas"])

class ReservaEntrada(BaseModel):
    sala_id: int
    usuario_id: int
    data: date
    horario_inicio: time
    horario_fim: time
    finalidade: str | None = Field(default=None, min_length=1)


class ReservaAtualizacao(BaseModel):
    sala_id: int | None = None
    usuario_id: int | None = None
    data: date | None = None
    horario_inicio: time | None = None
    horario_fim: time | None = None
    finalidade: str | None = Field(default=None, min_length=1)
    status: str | None = Field(default=None, min_length=1, max_length=30)


@router.get("/reservas", status_code=200)
def listar_reservas():
    try:
        resposta = supabase.table("reservas").select("*").execute()

        return resposta.data

    except APIError:
        raise HTTPException(status_code=500, detail="Erro ao consultar no banco de dados")


@router.get("/reservas/{reserva_id}", status_code=200)
def buscar_reserva(reserva_id: int):
    try:
        resposta = supabase.table("reservas").select("*").eq("id", reserva_id).execute()

    except APIError:
        raise HTTPException(status_code=500, detail="Erro ao consultar no banco de dados")

    if not resposta.data:
        raise HTTPException(status_code=404, detail="Reserva não encontrada")

    return resposta.data[0]


@router.post("/reservas", status_code=201)
def criar_reserva(dados: ReservaEntrada):
    if dados.horario_fim <= dados.horario_inicio:
        raise HTTPException(status_code=400, detail="O horário de fim deve ser depois do horário de início")

    # só professores e gestores podem reservar salas
    try:
        usuario = supabase.table("usuarios").select("id").eq("id", dados.usuario_id).in_("tipo", ["PROFESSOR", "GESTAO"]).execute()

    except APIError:
        raise HTTPException(status_code=500, detail="Erro ao consultar no banco de dados")

    if not usuario.data:
        raise HTTPException(status_code=400, detail="Apenas professores e gestores podem reservar salas")

    try:
        resposta = supabase.table("reservas").insert(dados.model_dump(mode="json")).execute()

        return {
            "mensagem": "Reserva criada com sucesso",
            **resposta.data[0],
        }

    except APIError as erro:
        raise HTTPException(status_code=400, detail=f"Não foi possível cadastrar a reserva: {erro.message}")



@router.put("/reservas/{reserva_id}", status_code=200)
def atualizar_reserva(reserva_id: int, dados: ReservaAtualizacao):
    alteracoes = dados.model_dump(mode="json", exclude_none=True)
    if not alteracoes:
        raise HTTPException(status_code=400, detail="Nenhum campo para atualizar")

    try:
        resposta = supabase.table("reservas").update(alteracoes).eq("id", reserva_id).execute()

    except APIError as erro:
        raise HTTPException(status_code=500, detail=f"Erro ao salvar no banco de dados: {erro.message}")

    if not resposta.data:
        raise HTTPException(status_code=404, detail="Reserva não encontrada")

    return {
        "mensagem": "Reserva atualizada com sucesso",
        **resposta.data[0],
    }



@router.delete("/reservas/{reserva_id}", status_code=204)
def deletar_reserva(reserva_id: int):
    try:
        resposta = supabase.table("reservas").delete().eq("id", reserva_id).execute()

    except APIError as erro:
        raise HTTPException(status_code=500, detail=f"Erro ao salvar no banco de dados: {erro.message}")

    if not resposta.data:
        raise HTTPException(status_code=404, detail="Não foi possível encontrar a reserva")
