-- data de expiração do aviso: depois desse dia ele some do mural (vazio = não expira)
alter table avisos add column expira_em date;

-- links das imagens do aviso (até 3), guardadas no Storage do Supabase
alter table avisos add column imagens text[] not null default '{}';

-- bucket público onde a API salva as imagens dos avisos
-- público = qualquer um com o link consegue ver a imagem (o app precisa disso para mostrar)
insert into storage.buckets (id, name, public)
values ('avisos', 'avisos', true)
on conflict (id) do nothing;
