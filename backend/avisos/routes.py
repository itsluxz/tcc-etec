import base64
import binascii
import uuid
from datetime import date

from fastapi import HTTPException, APIRouter
from pydantic import BaseModel, Field
from postgrest.exceptions import APIError
from database import supabase

router = APIRouter(tags=["avisos"])

# bucket do Storage do Supabase onde ficam as imagens (script em banco_dados/avisos_expiracao_imagens.sql)
BUCKET_IMAGENS = "avisos"
TIPOS_IMAGEM = {"image/jpeg": "jpg", "image/png": "png", "image/webp": "webp"}
TAMANHO_MAXIMO = 5 * 1024 * 1024  # 5 MB por imagem


class AvisoEntrada(BaseModel):
    titulo: str = Field(min_length=1, max_length=200)
    descricao: str = Field(min_length=1)
    autor_id: int | None = None
    # último dia em que o aviso aparece; vazio = não expira
    expira_em: date | None = None
    # links devolvidos pelo POST /avisos/imagens
    imagens: list[str] = Field(default_factory=list, max_length=3)

class AvisoAtualizacao(BaseModel):
    titulo: str | None = Field(default=None, min_length=1, max_length=200)
    descricao: str | None = Field(default=None, min_length=1)
    autor_id: int | None = None
    ativo: bool | None = None
    expira_em: date | None = None
    imagens: list[str] | None = Field(default=None, max_length=3)

class ImagemEntrada(BaseModel):
    # conteúdo da imagem em base64 (o expo-image-picker já entrega assim)
    base64: str = Field(min_length=1)
    tipo: str = "image/jpeg"


@router.get("/avisos", status_code=200)
def listar_avisos():
    try:
        resposta = supabase.table("avisos").select("*").order("criado_em", desc=True).execute()

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


# envia uma imagem para o Storage e devolve o link; o app manda os links no POST /avisos
@router.post("/avisos/imagens", status_code=201)
def enviar_imagem(dados: ImagemEntrada):
    extensao = TIPOS_IMAGEM.get(dados.tipo)
    if not extensao:
        raise HTTPException(status_code=400, detail="Use uma imagem JPG, PNG ou WEBP")

    try:
        conteudo = base64.b64decode(dados.base64, validate=True)
    except (binascii.Error, ValueError):
        raise HTTPException(status_code=400, detail="Imagem inválida")

    if len(conteudo) > TAMANHO_MAXIMO:
        raise HTTPException(status_code=400, detail="A imagem passa de 5 MB")

    caminho = f"{uuid.uuid4()}.{extensao}"
    try:
        supabase.storage.from_(BUCKET_IMAGENS).upload(caminho, conteudo, {"content-type": dados.tipo})
    except Exception as erro:
        raise HTTPException(status_code=500, detail=f"Não foi possível salvar a imagem: {erro}")

    return {"url": supabase.storage.from_(BUCKET_IMAGENS).get_public_url(caminho)}


@router.post("/avisos", status_code=201)
def criar_aviso(dados: AvisoEntrada):
    if dados.expira_em and dados.expira_em < date.today():
        raise HTTPException(status_code=400, detail="A data de expiração já passou")

    try:
        # mode="json" converte a data para texto, formato aceito pelo supabase
        resposta = supabase.table("avisos").insert(dados.model_dump(mode="json")).execute()

        return {
            "mensagem": "Aviso criado com sucesso",
            **resposta.data[0],
        }

    except APIError as erro:
        raise HTTPException(status_code=400, detail=f"Não foi possível cadastrar o aviso: {erro.message}")


@router.put("/avisos/{aviso_id}", status_code=200)
def atualizar_aviso(aviso_id: int, dados: AvisoAtualizacao):
    if dados.expira_em and dados.expira_em < date.today():
        raise HTTPException(status_code=400, detail="A data de expiração já passou")

    # só os campos enviados; "expira_em": null volta o aviso para "não expira",
    # nos outros campos o null é ignorado
    alteracoes = {
        campo: valor
        for campo, valor in dados.model_dump(mode="json", exclude_unset=True).items()
        if valor is not None or campo == "expira_em"
    }
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
