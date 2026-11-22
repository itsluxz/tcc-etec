from fastapi import HTTPException, APIRouter
from pydantic import BaseModel, Field
from postgrest.exceptions import APIError
from database import supabase
from notas.routes import usuario_tem_tipo

router = APIRouter(tags=["disciplinas"])

# traz os professores de cada disciplina pela tabela professor_disciplinas
CAMPOS = "*, professores:usuarios(id, nome)"

class DisciplinaEntrada(BaseModel):
    nome: str = Field(min_length=1, max_length=100)

class ProfessorDisciplinaEntrada(BaseModel):
    professor_id: int


def nome_duplicado(erro):
    return "disciplinas_nome_key" in (erro.message or "")


@router.get("/disciplinas", status_code=200)
def listar_disciplinas(professor_id: int | None = None):
    try:
        # ?professor_id=14 lista só as disciplinas que esse professor dá aula
        if professor_id:
            resposta = supabase.table("professor_disciplinas").select("disciplinas(*)").eq("professor_id", professor_id).execute()
            return [linha["disciplinas"] for linha in resposta.data]

        resposta = supabase.table("disciplinas").select(CAMPOS).execute()
        return resposta.data

    except APIError:
        raise HTTPException(status_code=500, detail="Erro ao consultar no banco de dados")


@router.get("/disciplinas/{disciplina_id}", status_code=200)
def buscar_disciplina(disciplina_id: int):
    try:
        resposta = supabase.table("disciplinas").select(CAMPOS).eq("id", disciplina_id).execute()

    except APIError:
        raise HTTPException(status_code=500, detail="Erro ao consultar no banco de dados")

    if not resposta.data:
        raise HTTPException(status_code=404, detail="Disciplina não encontrada")

    return resposta.data[0]


@router.post("/disciplinas", status_code=201)
def criar_disciplina(dados: DisciplinaEntrada):
    try:
        resposta = supabase.table("disciplinas").insert(dados.model_dump()).execute()

        return {
            "mensagem": "Disciplina criada com sucesso",
            **resposta.data[0],
        }

    except APIError as erro:
        if nome_duplicado(erro):
            raise HTTPException(status_code=409, detail="Disciplina já cadastrada")
        raise HTTPException(status_code=400, detail=f"Não foi possível cadastrar a disciplina: {erro.message}")


@router.put("/disciplinas/{disciplina_id}", status_code=200)
def atualizar_disciplina(disciplina_id: int, dados: DisciplinaEntrada):
    try:
        resposta = supabase.table("disciplinas").update(dados.model_dump()).eq("id", disciplina_id).execute()

    except APIError as erro:
        if nome_duplicado(erro):
            raise HTTPException(status_code=409, detail="Disciplina já cadastrada")
        raise HTTPException(status_code=500, detail=f"Erro ao salvar no banco de dados: {erro.message}")

    if not resposta.data:
        raise HTTPException(status_code=404, detail="Disciplina não encontrada")

    return {
        "mensagem": "Disciplina atualizada com sucesso",
        **resposta.data[0],
    }


@router.delete("/disciplinas/{disciplina_id}", status_code=204)
def deletar_disciplina(disciplina_id: int):
    try:
        # as ligações com professores são apagadas junto (on delete cascade)
        resposta = supabase.table("disciplinas").delete().eq("id", disciplina_id).execute()

    except APIError as erro:
        raise HTTPException(status_code=500, detail=f"Erro ao salvar no banco de dados: {erro.message}")

    if not resposta.data:
        raise HTTPException(status_code=404, detail="Não foi possível encontrar a disciplina")


# ligar e desligar professores de uma disciplina

@router.post("/disciplinas/{disciplina_id}/professores", status_code=201)
def adicionar_professor(disciplina_id: int, dados: ProfessorDisciplinaEntrada):
    if not usuario_tem_tipo(dados.professor_id, ["PROFESSOR"]):
        raise HTTPException(status_code=400, detail="Professor não encontrado")

    try:
        supabase.table("professor_disciplinas").insert({
            "professor_id": dados.professor_id,
            "disciplina_id": disciplina_id,
        }).execute()

        return {"mensagem": "Professor adicionado à disciplina"}

    except APIError as erro:
        if "professor_disciplinas_pkey" in (erro.message or ""):
            raise HTTPException(status_code=409, detail="Esse professor já dá aula dessa disciplina")
        raise HTTPException(status_code=400, detail=f"Não foi possível adicionar o professor: {erro.message}")


@router.delete("/disciplinas/{disciplina_id}/professores/{professor_id}", status_code=204)
def remover_professor(disciplina_id: int, professor_id: int):
    try:
        resposta = (
            supabase.table("professor_disciplinas")
            .delete()
            .eq("disciplina_id", disciplina_id)
            .eq("professor_id", professor_id)
            .execute()
        )

    except APIError as erro:
        raise HTTPException(status_code=500, detail=f"Erro ao salvar no banco de dados: {erro.message}")

    if not resposta.data:
        raise HTTPException(status_code=404, detail="Esse professor não dá aula dessa disciplina")
