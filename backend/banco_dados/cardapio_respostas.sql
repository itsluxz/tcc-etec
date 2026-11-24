-- respostas dos alunos para "Comerá hoje?" na tela de Merenda
-- cada aluno tem no máximo uma resposta por cardápio (a chave primária garante isso)
create table cardapio_respostas (
  cardapio_id int4 not null references cardapios(id) on delete cascade,
  aluno_id int4 not null references usuarios(id) on delete cascade,
  vai_comer boolean not null,
  respondido_em timestamp default now(),
  primary key (cardapio_id, aluno_id)
);
