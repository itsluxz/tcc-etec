-- reserva que se repete toda semana (ex: toda sexta, das 07:00 às 10:00, aula de matemática)
-- cada semana vira uma linha normal em reservas; as da mesma série têm o mesmo recorrencia_id
-- reserva avulsa fica com recorrencia_id vazio
alter table reservas add column recorrencia_id uuid;

create index reservas_recorrencia_id_idx on reservas (recorrencia_id);
