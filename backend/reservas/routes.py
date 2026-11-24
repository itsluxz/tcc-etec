import uuid
from datetime import date, time, timedelta

from fastapi import HTTPException, APIRouter
from pydantic import BaseModel, Field
from postgrest.exceptions import APIError
from database import supabase

router = APIRouter(tags=["reservas"])

# traz a sala e quem reservou junto com a reserva
CAMPOS = "*, sala:salas(nome, tipo), usuario:usuarios(nome)"

class ReservaEntrada(BaseModel):
    sala_id: int
    usuario_id: int
    data: date
    horario_inicio: time
    horario_fim: time
    finalidade: str | None = Field(default=None, min_length=1)
    # reserva recorrente: repete toda semana, no mesmo dia da semana de "data", até essa data
    repetir_ate: date | None = None


# no máximo um ano de reservas numa série só
MAX_SEMANAS = 52


class ReservaAtualizacao(BaseModel):
    sala_id: int | None = None
    usuario_id: int | None = None
    data: date | None = None
    horario_inicio: time | None = None
    horario_fim: time | None = None
    finalidade: str | None = Field(default=None, min_length=1)
    status: str | None = Field(default=None, min_length=1, max_length=30)


# todas as datas da série: a primeira e a mesma semana seguinte, até repetir_ate
def datas_da_serie(inicio, repetir_ate):
    datas = [inicio]
    if repetir_ate:
        proxima = inicio + timedelta(days=7)
        while proxima <= repetir_ate:
            datas.append(proxima)
            proxima += timedelta(days=7)
    return datas


# quais dessas datas já têm outra reserva da sala com horário que se cruza (uma consulta só)
def datas_ocupadas(sala_id, datas, inicio, fim):
    try:
        resposta = (
            supabase.table("reservas")
            .select("data")
            .eq("sala_id", sala_id)
            .in_("data", [data.isoformat() for data in datas])
            .lt("horario_inicio", fim.isoformat())
            .gt("horario_fim", inicio.isoformat())
            .execute()
        )

    except APIError:
        raise HTTPException(status_code=500, detail="Erro ao consultar no banco de dados")

    ocupadas = {linha["data"] for linha in resposta.data}
    return [data for data in datas if data.isoformat() in ocupadas]


@router.get("/reservas", status_code=200)
def listar_reservas(data: date | None = None, sala_id: int | None = None, usuario_id: int | None = None):
    try:
        # filtros opcionais, ex: /reservas?data=2026-11-12 ou /reservas?usuario_id=14
        consulta = supabase.table("reservas").select(CAMPOS).order("horario_inicio")
        if data:
            consulta = consulta.eq("data", data.isoformat())
        if sala_id:
            consulta = consulta.eq("sala_id", sala_id)
        if usuario_id:
            consulta = consulta.eq("usuario_id", usuario_id)
        resposta = consulta.execute()

        return resposta.data

    except APIError:
        raise HTTPException(status_code=500, detail="Erro ao consultar no banco de dados")


@router.get("/reservas/{reserva_id}", status_code=200)
def buscar_reserva(reserva_id: int):
    try:
        resposta = supabase.table("reservas").select(CAMPOS).eq("id", reserva_id).execute()

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

    if dados.repetir_ate:
        if dados.repetir_ate <= dados.data:
            raise HTTPException(status_code=400, detail="A data final da repetição deve ser depois da primeira reserva")
        if dados.repetir_ate > dados.data + timedelta(weeks=MAX_SEMANAS):
            raise HTTPException(status_code=400, detail="A repetição pode durar no máximo um ano")

    datas = datas_da_serie(dados.data, dados.repetir_ate)

    # se qualquer semana estiver ocupada, não cria nenhuma (e diz quais datas deram conflito)
    conflitos = datas_ocupadas(dados.sala_id, datas, dados.horario_inicio, dados.horario_fim)
    if conflitos:
        if len(datas) == 1:
            raise HTTPException(status_code=409, detail="Essa sala já está reservada nesse horário")
        lista = ", ".join(data.strftime("%d/%m") for data in conflitos)
        raise HTTPException(status_code=409, detail=f"Essa sala já está reservada nesse horário em: {lista}")

    base = dados.model_dump(mode="json", exclude={"repetir_ate"})
    recorrencia_id = str(uuid.uuid4()) if len(datas) > 1 else None
    novas = [
        {**base, "data": data.isoformat(), **({"recorrencia_id": recorrencia_id} if recorrencia_id else {})}
        for data in datas
    ]

    try:
        resposta = supabase.table("reservas").insert(novas).execute()

    except APIError as erro:
        raise HTTPException(status_code=400, detail=f"Não foi possível cadastrar a reserva: {erro.message}")

    if recorrencia_id:
        return {
            "mensagem": f"{len(resposta.data)} reservas criadas, uma por semana",
            "recorrencia_id": recorrencia_id,
            "reservas": resposta.data,
        }

    return {
        "mensagem": "Reserva criada com sucesso",
        **resposta.data[0],
    }


# cancela uma série recorrente a partir de um dia (por padrão, hoje); as reservas anteriores ficam
@router.delete("/reservas/recorrencias/{recorrencia_id}", status_code=200)
def cancelar_recorrencia(recorrencia_id: uuid.UUID, a_partir_de: date | None = None):
    inicio = a_partir_de or date.today()

    try:
        resposta = (
            supabase.table("reservas")
            .delete()
            .eq("recorrencia_id", str(recorrencia_id))
            .gte("data", inicio.isoformat())
            .execute()
        )

    except APIError as erro:
        raise HTTPException(status_code=500, detail=f"Erro ao salvar no banco de dados: {erro.message}")

    if not resposta.data:
        raise HTTPException(status_code=404, detail="Nenhuma reserva dessa série a partir dessa data")

    return {"mensagem": f"{len(resposta.data)} reserva(s) cancelada(s)", "canceladas": len(resposta.data)}



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
