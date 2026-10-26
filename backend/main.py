from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from users.routes import router as users_router
from avisos.routes import router as avisos_router
from cardapios.routes import router as cardapios_router
from salas.routes import router as salas_router
from reservas.routes import router as reservas_router
from eventos.routes import router as eventos_router
from substituicoes.routes import router as substituicoes_router
from atendimentos.routes import router as atendimentos_router
from ocorrencias.routes import router as ocorrencias_router

app = FastAPI(title="TCC-ETEC-API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["Content-Type"],
)

app.include_router(users_router)
app.include_router(avisos_router)
app.include_router(cardapios_router)
app.include_router(salas_router)
app.include_router(reservas_router)
app.include_router(eventos_router)
app.include_router(substituicoes_router)
app.include_router(atendimentos_router)
app.include_router(ocorrencias_router)
