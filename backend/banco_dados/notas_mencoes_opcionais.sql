-- deixa lançar uma menção por vez (ex: só a de trabalho agora, a de prova depois)
-- as três colunas passam a aceitar vazio; o check de 'I', 'R', 'B', 'MB' continua valendo quando há valor
alter table notas alter column mencao_trabalho drop not null;
alter table notas alter column mencao_atividades drop not null;
alter table notas alter column mencao_prova drop not null;
