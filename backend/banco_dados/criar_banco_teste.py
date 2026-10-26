"""Insere um usuário de teste no Supabase.

As tabelas são criadas pelo painel do Supabase (SQL Editor ou Table Editor);
este script só popula dados para testar a API.

Uso, dentro da pasta backend:
    python banco_dados/criar_banco_teste.py
"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import supabase  # noqa: E402
from users.routes import gerar_hash  # noqa: E402

USUARIO_TESTE = {
    "nome": "Usuário Teste",
    "email": "teste@etec.com",
    "senha": "teste123",
    "tipo": "ALUNO",
}


def criar_usuario_teste():
    existente = supabase.table("usuarios").select("id").eq("email", USUARIO_TESTE["email"]).execute()
    if existente.data:
        print(f"Usuário {USUARIO_TESTE['email']} já existe (id {existente.data[0]['id']})")
        return

    novo = {**USUARIO_TESTE, "senha": gerar_hash(USUARIO_TESTE["senha"])}
    resposta = supabase.table("usuarios").insert(novo).execute()
    print(f"Usuário de teste criado (id {resposta.data[0]['id']})")


if __name__ == "__main__":
    criar_usuario_teste()
