begin;

-- criação da tabela de tipo de usuário
create table if not exists t_user_type (
    user_type_id serial primary key,
    user_type_name text not null unique
);

-- criação da tabela de usuários
create table if not exists t_usuario (
    user_id serial primary key,
    user_username text not null,
    user_email text not null,
    user_documento varchar(11) unique not null,
    user_password text not null,
    user_salt text not null,
    user_token_version integer default 1,
    user_tipo integer not null default 1 references t_user_type(user_type_id),
    user_is_active boolean not null default true,
    user_created_at timestamp not null default current_timestamp,
    updated_at timestamp not null default current_timestamp,
    constraint u_user_email unique (user_email),
    constraint u_user_username unique (user_username),
    constraint chk_documento_11 check (char_length(user_documento) = 11)
);

-- criação da tabela de status de reclamação
create table if not exists t_reclamacao_status (
    reclamacao_status_id serial primary key,
    reclamacao_status_nome text not null unique
);

create table if not exists t_reclamacao_prioridade (
    reclamacao_prioridade_id smallserial primary key,
    reclamacao_prioridade_nome text not null unique
);

create table if not exists t_local (
    local_id serial primary key,
    local_cidade varchar(50) not null,
    local_estado char(2) not null,
    local_bairro varchar(50) not null,
    local_rua varchar(100) not null,
    local_numero varchar(10) not null,
    local_complemento varchar(100),
    local_latitude decimal(10, 8),
    local_longitude decimal(11, 8)
);
-- criação da tabela de reclamações
create table t_reclamacao (
    reclamacao_id serial primary key,
    reclamacao_user_id integer not null references t_usuario(user_id),
    reclamacao_protocolo text unique,
    reclamacao_titulo text not null,
    reclamacao_descricao text not null,
    reclamacao_data timestamp default current_timestamp,
    reclamacao_status integer not null default 1 references t_reclamacao_status(reclamacao_status_id),
    reclamacao_local_id integer references t_local(local_id),
    reclamacao_prioridade smallint not null default 2 references t_reclamacao_prioridade(reclamacao_prioridade_id),
    updated_at timestamp not null default current_timestamp,
    reclamacao_excluida boolean not null default false,
    reclamacao_tsv tsvector
);

create table if not exists t_reclamacao_status_historico (
    reclamacao_status_historico_id bigserial primary key,
    reclamacao_id integer not null references t_reclamacao(reclamacao_id),
    reclamacao_status_id integer not null references t_reclamacao_status(reclamacao_status_id),
    data_alteracao timestamp not null default current_timestamp
);

create table if not exists t_reclamacao_comentario (
    comentario_id bigserial primary key,
    comentario_reclamacao_id integer not null references t_reclamacao(reclamacao_id),
    comentario_user_id integer not null references t_usuario(user_id),
    comentario_texto text not null,
    comentario_data timestamp not null default current_timestamp,
    comentario_excluido boolean not null default false
);

-- criação da tabela de imagens de reclamação
create table t_reclamacao_imagem (
    reclamacao_imagem_id serial primary key,
    reclamacao_id integer not null references t_reclamacao(reclamacao_id),
    reclamacao_imagem_url text not null
);

update t_reclamacao
    set reclamacao_tsv = to_tsvector('portuguese',
        coalesce(reclamacao_titulo, '') || ' ' || coalesce(reclamacao_descricao, ''))
where reclamacao_tsv is null;

create index if not exists ix_reclamacao_tsv on t_reclamacao using gin(reclamacao_tsv);

create or replace function trg_reclamacao_tsv_update()
returns trigger as $$
begin
    new.reclamacao_tsv := to_tsvector('portuguese',
        coalesce(new.reclamacao_titulo, '') || ' ' || coalesce(new.reclamacao_descricao, ''));
    return new;
end
$$ language plpgsql;

drop trigger if exists tbiu_reclamacao_tsv on t_reclamacao;
create trigger tbiu_reclamacao_tsv
before insert or update of reclamacao_titulo, reclamacao_descricao
on t_reclamacao
for each row execute function trg_reclamacao_tsv_update();

create sequence if not exists seq_reclamacao_protocolo;

create or replace function trg_reclamacao_protocolo()
returns trigger as $$
declare
    ano text := to_char(current_date, 'YYYY');
    seq text := lpad(nextval('seq_reclamacao_protocolo')::text, 6, '0');
begin
    if new.reclamacao_protocolo is null then
        new.reclamacao_protocolo := ano || '-' || seq;
    end if;
    return new;
end
$$ language plpgsql;

drop trigger if exists tbi_reclamacao_protocolo on t_reclamacao;
create trigger tbi_reclamacao_protocolo
before insert on t_reclamacao
for each row execute function trg_reclamacao_protocolo();

create or replace function set_updated_at()
returns trigger as $$
begin
    new.updated_at = current_timestamp;
    return new;
end
$$ language plpgsql;

drop trigger if exists tbu_usuario_updated_at on t_usuario;
create trigger tbu_usuario_updated_at
before update on t_usuario
for each row execute function set_updated_at();

drop trigger if exists tbu_reclamacao_updated_at on t_reclamacao;
create trigger tbu_reclamacao_updated_at
before update on t_reclamacao
for each row execute function set_updated_at();

create index if not exists ix_reclamacao_status_data on t_reclamacao(reclamacao_status, reclamacao_data desc);
create index if not exists ix_reclamacao_user_data on t_reclamacao(reclamacao_user_id, reclamacao_data desc);

create index if not exists ix_local_geo on t_local(local_latitude, local_longitude);

insert into t_user_type (user_type_name) values
('Cidadão'),
('Administrador')
on conflict (user_type_name) do nothing;

insert into t_reclamacao_status (reclamacao_status_nome) values
('Aberto'),
('Em Análise'),
('Em Andamento'),
('Resolvido'),
('Fechado')
on conflict (reclamacao_status_nome) do nothing;

insert into t_reclamacao_prioridade (reclamacao_prioridade_nome) values
('Baixa'),
('Normal'),
('Alta'),
('Urgente')
on conflict (reclamacao_prioridade_nome) do nothing;

COMMIT;