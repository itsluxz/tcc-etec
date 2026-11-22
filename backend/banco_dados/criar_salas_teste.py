import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import supabase  # noqa: E402

# salas da escola: salas de aula 1 a 25 e a sala maker
SALAS_TESTE = [{"nome": f"Sala {numero}", "tipo": "Sala de aula"} for numero in range(1, 26)]
SALAS_TESTE.append({"nome": "Sala Maker", "tipo": "Sala maker"})


def criar_salas_teste():
    existentes = {sala["nome"] for sala in supabase.table("salas").select("nome").execute().data}
    novas = [{**sala, "disponivel": True} for sala in SALAS_TESTE if sala["nome"] not in existentes]

    if not novas:
        print("Todas as salas de teste já existem")
        return

    resposta = supabase.table("salas").insert(novas).execute()
    print(f"{len(resposta.data)} sala(s) criada(s): {', '.join(sala['nome'] for sala in resposta.data)}")


if __name__ == "__main__":
    criar_salas_teste()
