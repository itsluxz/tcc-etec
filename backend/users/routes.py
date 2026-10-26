import bcrypt

from fastapi import HTTPException, APIRouter
from pydantic import BaseModel, Field
from postgrest.exceptions import APIError
from database import supabase

router = APIRouter(tags=["users"])

# limites iguais aos das colunas da tabela usuarios
class UsuarioEntrada(BaseModel):
    nome: str = Field(min_length=1, max_length=150)
    email: str = Field(min_length=3, max_length=150)
    senha: str = Field(min_length=6)
    tipo: str = Field(min_length=1, max_length=20)

class UsuarioAtualizacao(BaseModel):
    nome: str | None = Field(default=None, min_length=1, max_length=150)
    email: str | None = Field(default=None, min_length=3, max_length=150)
    senha: str | None = Field(default=None, min_length=6)
    tipo: str | None = Field(default=None, min_length=1, max_length=20)
    ativo: bool | None = None

class LoginEntrada(BaseModel):
    email: str
    senha: str


def gerar_hash(senha):
    return bcrypt.hashpw(senha.encode(), bcrypt.gensalt()).decode()


def senha_confere(senha, senha_hash):
    try:
        return bcrypt.checkpw(senha.encode(), senha_hash.encode())
    except ValueError:
        # senha salva sem hash (cadastrada fora da API)
        return False


# nunca devolve a senha na resposta
def usuario_para_dict(linha):
    return {campo: valor for campo, valor in linha.items() if campo != "senha"}


@router.post("/login", status_code=200)
def login(dados: LoginEntrada):
    try:
        resposta = supabase.table("usuarios").select("*").eq("email", dados.email).execute()

    except APIError:
        raise HTTPException(status_code=500, detail="Erro ao consultar no banco de dados")

    usuario = resposta.data[0] if resposta.data else None

    # mesma mensagem para email inexistente e senha errada, para não revelar quem está cadastrado
    if not usuario or not senha_confere(dados.senha, usuario["senha"]):
        raise HTTPException(status_code=401, detail="Email ou senha inválidos")

    if not usuario["ativo"]:
        raise HTTPException(status_code=403, detail="Usuário desativado")

    return usuario_para_dict(usuario)


@router.get("/usuarios", status_code=200)
def listar_usuarios():
    try:
        resposta = supabase.table("usuarios").select("*").execute()

        return [usuario_para_dict(linha) for linha in resposta.data]

    except APIError:
        raise HTTPException(status_code=500, detail="Erro ao consultar no banco de dados")


@router.get("/usuarios/{usuario_id}", status_code=200)
def buscar_usuario(usuario_id: int):
    try:
        resposta = supabase.table("usuarios").select("*").eq("id", usuario_id).execute()

    except APIError:
        raise HTTPException(status_code=500, detail="Erro ao consultar no banco de dados")

    if not resposta.data:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    return usuario_para_dict(resposta.data[0])


@router.post("/usuarios", status_code=201)
def criar_usuario(dados: UsuarioEntrada):
    novo = dados.model_dump()
    novo["senha"] = gerar_hash(novo["senha"])

    try:
        resposta = supabase.table("usuarios").insert(novo).execute()

        return {
            "mensagem": "Usuário criado com sucesso",
            **usuario_para_dict(resposta.data[0]),
        }

    except APIError as erro:
        raise HTTPException(status_code=400, detail=f"Não foi possível cadastrar o usuário: {erro.message}")


@router.put("/usuarios/{usuario_id}", status_code=200)
def atualizar_usuario(usuario_id: int, dados: UsuarioAtualizacao):
    alteracoes = dados.model_dump(exclude_none=True)
    if not alteracoes:
        raise HTTPException(status_code=400, detail="Nenhum campo para atualizar")
    if alteracoes.get("senha"):
        alteracoes["senha"] = gerar_hash(alteracoes["senha"])

    try:
        resposta = supabase.table("usuarios").update(alteracoes).eq("id", usuario_id).execute()

    except APIError as erro:
        raise HTTPException(status_code=500, detail=f"Erro ao salvar no banco de dados: {erro.message}")

    if not resposta.data:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    return {
        "mensagem": "Usuário atualizado com sucesso",
        **usuario_para_dict(resposta.data[0]),
    }


@router.delete("/usuarios/{usuario_id}", status_code=204)
def deletar_usuario(usuario_id: int):
    try:
        resposta = supabase.table("usuarios").delete().eq("id", usuario_id).execute()

    except APIError as erro:
        raise HTTPException(status_code=500, detail=f"Erro ao salvar no banco de dados: {erro.message}")

    if not resposta.data:
        raise HTTPException(status_code=404, detail="Não foi possível encontrar o usuário")
