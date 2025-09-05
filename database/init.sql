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
create table if not exists t_ocorrencia_status (
    ocorrencia_status_id serial primary key,
    ocorrencia_status_nome text not null unique
);

create table if not exists t_ocorrencia_prioridade (
    ocorrencia_prioridade_id smallserial primary key,
    ocorrencia_prioridade_nome text not null unique
);

create table if not exists t_local (
    local_id serial primary key,
    local_cidade varchar(50) not null,
    local_estado char(2) not null,
    local_bairro varchar(50) not null,
    local_rua varchar(100) not null,
    local_complemento varchar(100),
    local_latitude decimal(10, 8),
    local_longitude decimal(11, 8)
);
-- criação da tabela de reclamações
create table if not exists t_ocorrencia (
    ocorrencia_id serial primary key,
    ocorrencia_user_id integer not null references t_usuario(user_id),
    ocorrencia_protocolo text unique,
    ocorrencia_titulo text not null,
    ocorrencia_descricao text not null,
    ocorrencia_data timestamp default current_timestamp,
    ocorrencia_status integer not null default 1 references t_ocorrencia_status(ocorrencia_status_id),
    ocorrencia_local_id integer references t_local(local_id),
    ocorrencia_prioridade smallint not null default 2 references t_ocorrencia_prioridade(ocorrencia_prioridade_id),
    updated_at timestamp not null default current_timestamp,
    ocorrencia_excluida boolean not null default false,
    ocorrencia_tsv tsvector
);

create table if not exists t_ocorrencia_status_historico (
    ocorrencia_status_historico_id bigserial primary key,
    ocorrencia_id integer not null references t_ocorrencia(ocorrencia_id),
    ocorrencia_status_id integer not null references t_ocorrencia_status(ocorrencia_status_id),
    data_alteracao timestamp not null default current_timestamp
);

create table if not exists t_ocorrencia_comentario (
    comentario_id bigserial primary key,
    comentario_ocorrencia_id integer not null references t_ocorrencia(ocorrencia_id),
    comentario_user_id integer not null references t_usuario(user_id),
    comentario_texto text not null,
    comentario_data timestamp not null default current_timestamp,
    comentario_excluido boolean not null default false
);

-- criação da tabela de imagens de reclamação
create table t_ocorrencia_imagem (
    ocorrencia_imagem_id serial primary key,
    ocorrencia_id integer not null references t_ocorrencia(ocorrencia_id),
    ocorrencia_imagem_url text not null
);

update t_ocorrencia
    set ocorrencia_tsv = to_tsvector('portuguese',
        coalesce(ocorrencia_titulo, '') || ' ' || coalesce(ocorrencia_descricao, ''))
where ocorrencia_tsv is null;

create index if not exists ix_ocorrencia_tsv on t_ocorrencia using gin(ocorrencia_tsv);

create or replace function trg_ocorrencia_tsv_update()
returns trigger as $$
begin
    new.ocorrencia_tsv := to_tsvector('portuguese',
        coalesce(new.ocorrencia_titulo, '') || ' ' || coalesce(new.ocorrencia_descricao, ''));
    return new;
end
$$ language plpgsql;

drop trigger if exists tbiu_ocorrencia_tsv on t_ocorrencia;
create trigger tbiu_ocorrencia_tsv
before insert or update of ocorrencia_titulo, ocorrencia_descricao
on t_ocorrencia
for each row execute function trg_ocorrencia_tsv_update();

create sequence if not exists seq_ocorrencia_protocolo;

create or replace function trg_ocorrencia_protocolo()
returns trigger as $$
declare
    ano text := to_char(current_date, 'YYYY');
    seq text := lpad(nextval('seq_ocorrencia_protocolo')::text, 6, '0');
begin
    if new.ocorrencia_protocolo is null then
        new.ocorrencia_protocolo := ano || '-' || seq;
    end if;
    return new;
end
$$ language plpgsql;

drop trigger if exists tbi_ocorrencia_protocolo on t_ocorrencia;
create trigger tbi_ocorrencia_protocolo
before insert on t_ocorrencia
for each row execute function trg_ocorrencia_protocolo();

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

drop trigger if exists tbu_ocorrencia_updated_at on t_ocorrencia;
create trigger tbu_ocorrencia_updated_at
before update on t_ocorrencia
for each row execute function set_updated_at();

create index if not exists ix_ocorrencia_status_data on t_ocorrencia(ocorrencia_status, ocorrencia_data desc);
create index if not exists ix_ocorrencia_user_data on t_ocorrencia(ocorrencia_user_id, ocorrencia_data desc);

create index if not exists ix_local_geo on t_local(local_latitude, local_longitude);

insert into t_user_type (user_type_name) values
('Cidadão'),
('Administrador')
on conflict (user_type_name) do nothing;

insert into t_ocorrencia_status (ocorrencia_status_nome) values
('Aberto'),
('Em Análise'),
('Em Andamento'),
('Resolvido'),
('Fechado')
on conflict (ocorrencia_status_nome) do nothing;

insert into t_ocorrencia_prioridade (ocorrencia_prioridade_nome) values
('Baixa'),
('Normal'),
('Alta'),
('Urgente')
on conflict (ocorrencia_prioridade_nome) do nothing;

COMMIT;