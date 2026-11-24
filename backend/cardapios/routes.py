from datetime import date, datetime, timezone

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


# ---------- "Comerá hoje?": respostas dos alunos ----------
# tabela cardapio_respostas (script em banco_dados/cardapio_respostas.sql)

class RespostaEntrada(BaseModel):
    vai_comer: bool


def buscar_data_do_cardapio(cardapio_id):
    try:
        resposta = supabase.table("cardapios").select("data").eq("id", cardapio_id).execute()

    except APIError:
        raise HTTPException(status_code=500, detail="Erro ao consultar no banco de dados")

    if not resposta.data:
        raise HTTPException(status_code=404, detail="Cardápio não encontrado")

    return date.fromisoformat(resposta.data[0]["data"])


def eh_aluno(usuario_id):
    try:
        resposta = supabase.table("usuarios").select("id").eq("id", usuario_id).eq("tipo", "ALUNO").execute()

    except APIError:
        raise HTTPException(status_code=500, detail="Erro ao consultar no banco de dados")

    return bool(resposta.data)


# quantos alunos responderam sim e não (tela da gestão)
@router.get("/cardapios/{cardapio_id}/resumo", status_code=200)
def resumo_respostas(cardapio_id: int):
    buscar_data_do_cardapio(cardapio_id)

    try:
        resposta = supabase.table("cardapio_respostas").select("vai_comer").eq("cardapio_id", cardapio_id).execute()

    except APIError:
        raise HTTPException(status_code=500, detail="Erro ao consultar no banco de dados")

    sim = sum(1 for linha in resposta.data if linha["vai_comer"])
    nao = len(resposta.data) - sim

    return {"cardapio_id": cardapio_id, "sim": sim, "nao": nao, "total": len(resposta.data)}


# resposta de um aluno; vai_comer vem null se ele ainda não respondeu
@router.get("/cardapios/{cardapio_id}/respostas/{aluno_id}", status_code=200)
def buscar_resposta(cardapio_id: int, aluno_id: int):
    try:
        resposta = (
            supabase.table("cardapio_respostas")
            .select("*")
            .eq("cardapio_id", cardapio_id)
            .eq("aluno_id", aluno_id)
            .execute()
        )

    except APIError:
        raise HTTPException(status_code=500, detail="Erro ao consultar no banco de dados")

    if not resposta.data:
        return {"cardapio_id": cardapio_id, "aluno_id": aluno_id, "vai_comer": None}

    return resposta.data[0]


# o aluno responde (ou muda a resposta): {"vai_comer": true}
@router.put("/cardapios/{cardapio_id}/respostas/{aluno_id}", status_code=200)
def responder(cardapio_id: int, aluno_id: int, dados: RespostaEntrada):
    if buscar_data_do_cardapio(cardapio_id) < date.today():
        raise HTTPException(status_code=400, detail="Esse cardápio já passou, não dá mais para responder")

    if not eh_aluno(aluno_id):
        raise HTTPException(status_code=403, detail="Só alunos podem responder")

    nova = {
        "cardapio_id": cardapio_id,
        "aluno_id": aluno_id,
        "vai_comer": dados.vai_comer,
        # atualiza o horário quando o aluno muda a resposta (o default do banco só vale no insert)
        "respondido_em": datetime.now(timezone.utc).isoformat(),
    }

    try:
        # upsert: cria a resposta ou troca a que já existia (chave cardapio_id + aluno_id)
        resposta = supabase.table("cardapio_respostas").upsert(nova, on_conflict="cardapio_id,aluno_id").execute()

    except APIError as erro:
        raise HTTPException(status_code=400, detail=f"Não foi possível salvar a resposta: {erro.message}")

    return {
        "mensagem": "Resposta salva com sucesso",
        **resposta.data[0],
    }
