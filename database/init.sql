begin;

set
    time zone 'America/Sao_Paulo';

create extension if not exists postgis;

create table if not exists t_user_type (
    user_type_id serial primary key,
    user_type_name text not null unique
);

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

create table if not exists t_ocorrencia_status (
    ocorrencia_status_id serial primary key,
    ocorrencia_status_nome text not null unique
);

create table if not exists t_ocorrencia_prioridade (
    ocorrencia_prioridade_id smallserial primary key,
    ocorrencia_prioridade_nome text not null unique
);

create table if not exists t_uf (
    uf_id serial primary key not null,
    uf_nome varchar(250),
    uf_sigla varchar(2) unique,
    uf_ibge integer
);

create table if not exists t_municipio (
    municipio_id serial primary key not null,
    municipio_nome varchar(250),
    municipio_ibge integer unique,
    municipio_uf varchar(2) references t_uf(uf_sigla)
);

create table if not exists t_local (
    local_id serial primary key,
    local_municipio_id integer references t_municipio(municipio_id),
    local_estado char(2) not null,
    local_bairro varchar(50) not null,
    local_rua varchar(100) not null,
    local_complemento varchar(100),
    location geography(point, 4326) not null,
    local_excluido boolean not null default false
);

create table if not exists t_ocorrencia (
    ocorrencia_id serial primary key,
    ocorrencia_user_id integer not null references t_usuario(user_id),
    ocorrencia_anonima boolean not null default false,
    ocorrencia_protocolo text unique,
    ocorrencia_titulo text not null,
    ocorrencia_descricao text not null,
    ocorrencia_data timestamp default current_timestamp,
    ocorrencia_status integer not null default 1 references t_ocorrencia_status(ocorrencia_status_id),
    ocorrencia_local_id integer references t_local(local_id),
    ocorrencia_prioridade smallint not null default 2 references t_ocorrencia_prioridade(ocorrencia_prioridade_id),
    updated_at timestamp not null default current_timestamp,
    ocorrencia_atribuida integer not null default 2 references t_user_type(user_type_id),
    ocorrencia_excluida boolean not null default false,
    ocorrencia_tsv tsvector
);

create table if not exists t_ocorrencia_historico (
    historico_id bigserial primary key,
    ocorrencia_id integer not null references t_ocorrencia(ocorrencia_id),
    acao text not null check (
        acao in ('create', 'update', 'delete', 'attach', 'detach')
    ),
    entidade text not null check (
        entidade in (
            'ocorrencia',
            'imagem',
            'comentario',
            'local',
            'status',
            'prioridade',
            'atribuicao',
            'titulo',
            'descricao',
            'anonima',
            'excluida'
        )
    ),
    campo text,
    valor_anterior text,
    valor_novo text,
    entidade_id bigint,
    changed_by integer references t_usuario(user_id),
    changed_at timestamp not null default current_timestamp,
    meta jsonb not null default '{}' :: jsonb
);

create index if not exists idx_hist_ocid_time on t_ocorrencia_historico (ocorrencia_id, changed_at desc);

create index if not exists idx_hist_entidade on t_ocorrencia_historico (entidade);

create index if not exists idx_hist_acao on t_ocorrencia_historico (acao);

create table if not exists t_notificacao (
    notificacao_id bigserial primary key,
    notificacao_user_id integer not null references t_usuario(user_id),
    notificacao_ocorrencia_id integer references t_ocorrencia(ocorrencia_id),
    notificacao_tipo text not null check (
        notificacao_tipo in (
            'status_change',
            'comment',
            'image_added',
            'assigned',
            'generic'
        )
    ),
    notificacao_canal text not null default 'in_app' check (
        notificacao_canal in ('in_app', 'email', 'push', 'sms')
    ),
    notificacao_titulo text not null,
    notificacao_mensagem text not null,
    action_url text,
    prioridade smallint not null default 3 check (
        prioridade between 1
        and 5
    ),
    status text not null default 'queued' check (
        status in (
            'queued',
            'sending',
            'sent',
            'failed',
            'read',
            'canceled'
        )
    ),
    agendar_em timestamp,
    enviada_em timestamp,
    lida_em timestamp,
    cancelada_em timestamp,
    erro_envio text,
    meta jsonb not null default '{}' :: jsonb,
    created_at timestamp not null default current_timestamp,
    updated_at timestamp not null default current_timestamp
);

create index if not exists ix_notif_user_time on t_notificacao (notificacao_user_id, created_at desc);

create index if not exists ix_notif_ocorrencia on t_notificacao (notificacao_ocorrencia_id, created_at desc);

create index if not exists ix_notif_status_sched on t_notificacao (status, coalesce(agendar_em, created_at));

create index if not exists ix_notif_status_time on t_notificacao (status, created_at desc);

create index if not exists ix_notif_canal on t_notificacao (notificacao_canal);

create unique index if not exists uq_notif_dedup on t_notificacao (
    notificacao_user_id,
    coalesce(notificacao_ocorrencia_id, -1),
    notificacao_tipo
)
where
    status in ('queued', 'sending');

create
or replace function trg_notif_set_updated_at() returns trigger language plpgsql as $$ begin
    new .updated_at := current_timestamp;

return new;

end $$;

drop trigger if exists tbu_notificacao_updated_at on t_notificacao;

create trigger tbu_notificacao_updated_at before
update
    on t_notificacao for each row execute function trg_notif_set_updated_at();

create table if not exists t_ocorrencia_comentario (
    comentario_id bigserial primary key,
    comentario_ocorrencia_id integer not null references t_ocorrencia(ocorrencia_id),
    comentario_user_id integer not null references t_usuario(user_id),
    comentario_texto text not null,
    comentario_data timestamp not null default current_timestamp,
    comentario_excluido boolean not null default false
);

create table if not exists t_ocorrencia_imagem (
    ocorrencia_imagem_id serial primary key,
    ocorrencia_id integer not null references t_ocorrencia(ocorrencia_id),
    ocorrencia_imagem_url text not null
);

update
    t_ocorrencia
set
    ocorrencia_tsv = to_tsvector(
        'portuguese',
        coalesce(ocorrencia_titulo, '') || ' ' || coalesce(ocorrencia_descricao, '')
    )
where
    ocorrencia_tsv is null;

create index if not exists ix_ocorrencia_tsv on t_ocorrencia using gin(ocorrencia_tsv);

create
or replace function trg_ocorrencia_tsv_update() returns trigger as $$ begin
    new .ocorrencia_tsv := to_tsvector(
        'portuguese',
        coalesce(new .ocorrencia_titulo, '') || ' ' || coalesce(new .ocorrencia_descricao, '')
    );

return new;

end $$ language plpgsql;

drop trigger if exists tbiu_ocorrencia_tsv on t_ocorrencia;

create trigger tbiu_ocorrencia_tsv before
insert
    or
update
    of ocorrencia_titulo,
    ocorrencia_descricao on t_ocorrencia for each row execute function trg_ocorrencia_tsv_update();

create sequence if not exists seq_ocorrencia_protocolo;

create
or replace function trg_ocorrencia_protocolo() returns trigger as $$
declare
    ano text := to_char(current_date, 'YYYY');

seq text := lpad(
    nextval('seq_ocorrencia_protocolo') :: text,
    6,
    '0'
);

begin
    if new .ocorrencia_protocolo is null then new .ocorrencia_protocolo := ano || '-' || seq;

end if;

return new;

end $$ language plpgsql;

drop trigger if exists tbi_ocorrencia_protocolo on t_ocorrencia;

create trigger tbi_ocorrencia_protocolo before
insert
    on t_ocorrencia for each row execute function trg_ocorrencia_protocolo();

create
or replace function set_updated_at() returns trigger as $$ begin
    new .updated_at = current_timestamp;

return new;

end $$ language plpgsql;

drop trigger if exists tbu_usuario_updated_at on t_usuario;

create trigger tbu_usuario_updated_at before
update
    on t_usuario for each row execute function set_updated_at();

drop trigger if exists tbu_ocorrencia_updated_at on t_ocorrencia;

create trigger tbu_ocorrencia_updated_at before
update
    on t_ocorrencia for each row execute function set_updated_at();

create
or replace function fn_audit_get_user() returns integer language plpgsql as $$
declare
    uid integer;

begin
    begin
        uid := current_setting('app.user_id', true) :: int;

exception
    when others then uid := null;

end;

return uid;

end $$;

drop trigger if exists trg_ocorrencia_status_hist on t_ocorrencia;

drop function if exists fn_ocorrencia_status_hist();

create
or replace function fn_ocorrencia_hist() returns trigger language plpgsql as $$
declare
    v_user_id integer := nullif(current_setting('app.user_id', true), '') :: int;

begin
    if tg_op = 'insert' then
    insert into
        t_ocorrencia_historico (
            ocorrencia_id,
            acao,
            entidade,
            campo,
            valor_anterior,
            valor_novo,
            entidade_id,
            changed_by,
            changed_at,
            meta
        )
    values
        (
            new .ocorrencia_id,
            'create',
            'ocorrencia',
            null,
            null,
            null,
            null,
            v_user_id,
            current_timestamp,
            '{}' :: jsonb
        );

return new;

end if;

if tg_op = 'update' then if new .ocorrencia_status_id is distinct
from
    old .ocorrencia_status_id then
insert into
    t_ocorrencia_historico (
        ocorrencia_id,
        acao,
        entidade,
        campo,
        valor_anterior,
        valor_novo,
        entidade_id,
        changed_by,
        changed_at,
        meta
    )
values
    (
        new .ocorrencia_id,
        'update',
        'status',
        'status',
        coalesce(old .ocorrencia_status_id :: text, null),
        coalesce(new .ocorrencia_status_id :: text, null),
        null,
        v_user_id,
        current_timestamp,
        '{}' :: jsonb
    );

end if;

if new .ocorrencia_prioridade_id is distinct
from
    old .ocorrencia_prioridade_id then
insert into
    t_ocorrencia_historico (
        ocorrencia_id,
        acao,
        entidade,
        campo,
        valor_anterior,
        valor_novo,
        entidade_id,
        changed_by,
        changed_at,
        meta
    )
values
    (
        new .ocorrencia_id,
        'update',
        'prioridade',
        'prioridade',
        coalesce(old .ocorrencia_prioridade_id :: text, null),
        coalesce(new .ocorrencia_prioridade_id :: text, null),
        null,
        v_user_id,
        current_timestamp,
        '{}' :: jsonb
    );

end if;

if new .ocorrencia_atribuida_id is distinct
from
    old .ocorrencia_atribuida_id then
insert into
    t_ocorrencia_historico (
        ocorrencia_id,
        acao,
        entidade,
        campo,
        valor_anterior,
        valor_novo,
        entidade_id,
        changed_by,
        changed_at,
        meta
    )
values
    (
        new .ocorrencia_id,
        'update',
        'atribuicao',
        'atribuicao',
        coalesce(old .ocorrencia_atribuida_id :: text, null),
        coalesce(new .ocorrencia_atribuida_id :: text, null),
        null,
        v_user_id,
        current_timestamp,
        '{}' :: jsonb
    );

end if;

return new;

end if;

return new;

end;

$$;

drop trigger if exists trg_ocorrencia_hist_ins on t_ocorrencia;

create trigger trg_ocorrencia_hist_ins after
insert
    on t_ocorrencia for each row execute function fn_ocorrencia_hist();

drop trigger if exists trg_ocorrencia_hist_upd on t_ocorrencia;

create trigger trg_ocorrencia_hist_upd after
update
    on t_ocorrencia for each row execute function fn_ocorrencia_hist();

create
or replace function fn_oc_imagem_audit_ins() returns trigger language plpgsql as $$ begin
    insert into
        t_ocorrencia_historico (
            ocorrencia_id,
            acao,
            entidade,
            entidade_id,
            valor_novo,
            changed_by,
            meta
        )
    values
        (
            new .ocorrencia_id,
            'attach',
            'imagem',
            new .ocorrencia_imagem_id,
            new .ocorrencia_imagem_url,
            fn_audit_get_user(),
            jsonb_build_object('url', new .ocorrencia_imagem_url)
        );

return new;

end $$;

create
or replace function fn_oc_imagem_audit_del() returns trigger language plpgsql as $$ begin
    insert into
        t_ocorrencia_historico (
            ocorrencia_id,
            acao,
            entidade,
            entidade_id,
            valor_anterior,
            changed_by,
            meta
        )
    values
        (
            old .ocorrencia_id,
            'detach',
            'imagem',
            old .ocorrencia_imagem_id,
            old .ocorrencia_imagem_url,
            fn_audit_get_user(),
            jsonb_build_object('url', old .ocorrencia_imagem_url)
        );

return old;

end $$;

drop trigger if exists trg_oc_img_audit_ins on t_ocorrencia_imagem;

drop trigger if exists trg_oc_img_audit_del on t_ocorrencia_imagem;

create trigger trg_oc_img_audit_ins after
insert
    on t_ocorrencia_imagem for each row execute function fn_oc_imagem_audit_ins();

create trigger trg_oc_img_audit_del before
delete
    on t_ocorrencia_imagem for each row execute function fn_oc_imagem_audit_del();

create
or replace function fn_oc_coment_audit_ins() returns trigger language plpgsql as $$ begin
    insert into
        t_ocorrencia_historico (
            ocorrencia_id,
            acao,
            entidade,
            entidade_id,
            valor_novo,
            changed_by,
            meta
        )
    values
        (
            new .comentario_ocorrencia_id,
            'attach',
            'comentario',
            new .comentario_id,
            new .comentario_texto,
            fn_audit_get_user(),
            jsonb_build_object('preview', left(new .comentario_texto, 120))
        );

return new;

end $$;

create
or replace function fn_oc_coment_audit_del() returns trigger language plpgsql as $$ begin
    insert into
        t_ocorrencia_historico (
            ocorrencia_id,
            acao,
            entidade,
            entidade_id,
            valor_anterior,
            changed_by,
            meta
        )
    values
        (
            old .comentario_ocorrencia_id,
            'detach',
            'comentario',
            old .comentario_id,
            old .comentario_texto,
            fn_audit_get_user(),
            jsonb_build_object('preview', left(old .comentario_texto, 120))
        );

return old;

end $$;

drop trigger if exists trg_oc_com_audit_ins on t_ocorrencia_comentario;

drop trigger if exists trg_oc_com_audit_del on t_ocorrencia_comentario;

create trigger trg_oc_com_audit_ins after
insert
    on t_ocorrencia_comentario for each row execute function fn_oc_coment_audit_ins();

create trigger trg_oc_com_audit_del before
delete
    on t_ocorrencia_comentario for each row execute function fn_oc_coment_audit_del();

create
or replace function fn_oc_coment_audit_upd() returns trigger language plpgsql as $$ begin
    if new .comentario_excluido is distinct
    from
        old .comentario_excluido then
    insert into
        t_ocorrencia_historico (
            ocorrencia_id,
            acao,
            entidade,
            entidade_id,
            campo,
            valor_anterior,
            valor_novo,
            changed_by,
            meta
        )
    values
        (
            new .comentario_ocorrencia_id,
            'update',
            'comentario',
            new .comentario_id,
            'comentario_excluido',
            old .comentario_excluido :: text,
            new .comentario_excluido :: text,
            fn_audit_get_user(),
            jsonb_build_object('preview', left(new .comentario_texto, 120))
        );

end if;

return new;

end $$;

drop trigger if exists trg_oc_com_audit_upd on t_ocorrencia_comentario;

create trigger trg_oc_com_audit_upd after
update
    on t_ocorrencia_comentario for each row execute function fn_oc_coment_audit_upd();

create index if not exists ix_ocorrencia_status_data on t_ocorrencia(ocorrencia_status, ocorrencia_data desc);

create index if not exists ix_ocorrencia_user_data on t_ocorrencia(ocorrencia_user_id, ocorrencia_data desc);

create index if not exists t_local_location_gix on t_local using gist (location);

create index if not exists idx_hist_ocorrencia on t_ocorrencia_historico (
    ocorrencia_id,
    changed_at desc,
    historico_id desc
);

insert into
    t_uf (uf_nome, uf_sigla, uf_ibge)
values
    ('Acre', 'AC', 12),
    ('Alagoas', 'AL', 27),
    ('Amapá', 'AP', 16),
    ('Amazonas', 'AM', 13),
    ('Bahia', 'BA', 29),
    ('Ceará', 'CE', 23),
    ('Distrito Federal', 'DF', 53),
    ('Espírito Santo', 'ES', 32),
    ('Goiás', 'GO', 52),
    ('Maranhão', 'MA', 21),
    ('Mato Grosso', 'MT', 51),
    ('Mato Grosso do Sul', 'MS', 50),
    ('Minas Gerais', 'MG', 31),
    ('Pará', 'PA', 15),
    ('Paraíba', 'PB', 25),
    ('Paraná', 'PR', 41),
    ('Pernambuco', 'PE', 26),
    ('Piauí', 'PI', 22),
    ('Rio de Janeiro', 'RJ', 33),
    ('Rio Grande do Norte', 'RN', 24),
    ('Rio Grande do Sul', 'RS', 43),
    ('Rondônia', 'RO', 11),
    ('Roraima', 'RR', 14),
    ('Santa Catarina', 'SC', 42),
    ('São Paulo', 'SP', 35),
    ('Sergipe', 'SE', 28),
    ('Tocantins', 'TO', 17) on conflict (uf_sigla) do nothing;

insert into
    t_municipio (
        municipio_id,
        municipio_nome,
        municipio_ibge,
        municipio_uf
    )
values
    (4312, 'Abdon Batista', 4200051, 'SC'),
    (4313, 'Abelardo Luz', 4200101, 'SC'),
    (4314, 'Agrolândia', 4200200, 'SC'),
    (4315, 'Agronômica', 4200309, 'SC'),
    (4316, 'Água Doce', 4200408, 'SC'),
    (4317, 'Águas de Chapecó', 4200507, 'SC'),
    (4318, 'Águas Frias', 4200556, 'SC'),
    (4319, 'Águas Mornas', 4200606, 'SC'),
    (4320, 'Alfredo Wagner', 4200705, 'SC'),
    (4321, 'Alto Bela Vista', 4200754, 'SC'),
    (4322, 'Anchieta', 4200804, 'SC'),
    (4323, 'Angelina', 4200903, 'SC'),
    (4324, 'Anita Garibaldi', 4201000, 'SC'),
    (4325, 'Anitápolis', 4201109, 'SC'),
    (4326, 'Antônio Carlos', 4201208, 'SC'),
    (4327, 'Apiúna', 4201257, 'SC'),
    (4328, 'Arabutã', 4201273, 'SC'),
    (4329, 'Araquari', 4201307, 'SC'),
    (4330, 'Araranguá', 4201406, 'SC'),
    (4331, 'Armazém', 4201505, 'SC'),
    (4332, 'Arroio Trinta', 4201604, 'SC'),
    (4333, 'Arvoredo', 4201653, 'SC'),
    (4334, 'Ascurra', 4201703, 'SC'),
    (4335, 'Atalanta', 4201802, 'SC'),
    (4336, 'Aurora', 4201901, 'SC'),
    (4337, 'Balneário Arroio do Silva', 4201950, 'SC'),
    (4338, 'Balneário Camboriú', 4202008, 'SC'),
    (4339, 'Balneário Barra do Sul', 4202057, 'SC'),
    (4340, 'Balneário Gaivota', 4202073, 'SC'),
    (4341, 'Bandeirante', 4202081, 'SC'),
    (4342, 'Barra Bonita', 4202099, 'SC'),
    (4343, 'Barra Velha', 4202107, 'SC'),
    (4344, 'Bela Vista do Toldo', 4202131, 'SC'),
    (4345, 'Belmonte', 4202156, 'SC'),
    (4346, 'Benedito Novo', 4202206, 'SC'),
    (4347, 'Biguaçu', 4202305, 'SC'),
    (4348, 'Blumenau', 4202404, 'SC'),
    (4349, 'Bocaina do Sul', 4202438, 'SC'),
    (4350, 'Bombinhas', 4202453, 'SC'),
    (4351, 'Bom Jardim da Serra', 4202503, 'SC'),
    (4352, 'Bom Jesus', 4202537, 'SC'),
    (4353, 'Bom Jesus do Oeste', 4202578, 'SC'),
    (4354, 'Bom Retiro', 4202602, 'SC'),
    (4355, 'Botuverá', 4202701, 'SC'),
    (4356, 'Braço do Norte', 4202800, 'SC'),
    (4357, 'Braço do Trombudo', 4202859, 'SC'),
    (4358, 'Brunópolis', 4202875, 'SC'),
    (4359, 'Brusque', 4202909, 'SC'),
    (4360, 'Caçador', 4203006, 'SC'),
    (4361, 'Caibi', 4203105, 'SC'),
    (4362, 'Calmon', 4203154, 'SC'),
    (4363, 'Camboriú', 4203204, 'SC'),
    (4364, 'Capão Alto', 4203253, 'SC'),
    (4365, 'Campo Alegre', 4203303, 'SC'),
    (4366, 'Campo Belo do Sul', 4203402, 'SC'),
    (4367, 'Campo Erê', 4203501, 'SC'),
    (4368, 'Campos Novos', 4203600, 'SC'),
    (4369, 'Canelinha', 4203709, 'SC'),
    (4370, 'Canoinhas', 4203808, 'SC'),
    (4371, 'Capinzal', 4203907, 'SC'),
    (4372, 'Capivari de Baixo', 4203956, 'SC'),
    (4373, 'Catanduvas', 4204004, 'SC'),
    (4374, 'Caxambu do Sul', 4204103, 'SC'),
    (4375, 'Celso Ramos', 4204152, 'SC'),
    (4376, 'Cerro Negro', 4204178, 'SC'),
    (4377, 'Chapadão do Lageado', 4204194, 'SC'),
    (4378, 'Chapecó', 4204202, 'SC'),
    (4379, 'Cocal do Sul', 4204251, 'SC'),
    (4380, 'Concórdia', 4204301, 'SC'),
    (4381, 'Cordilheira Alta', 4204350, 'SC'),
    (4382, 'Coronel Freitas', 4204400, 'SC'),
    (4383, 'Coronel Martins', 4204459, 'SC'),
    (4384, 'Corupá', 4204509, 'SC'),
    (4385, 'Correia Pinto', 4204558, 'SC'),
    (4386, 'Criciúma', 4204608, 'SC'),
    (4387, 'Cunha Porã', 4204707, 'SC'),
    (4388, 'Cunhataí', 4204756, 'SC'),
    (4389, 'Curitibanos', 4204806, 'SC'),
    (4390, 'Descanso', 4204905, 'SC'),
    (4391, 'Dionísio Cerqueira', 4205001, 'SC'),
    (4392, 'Dona Emma', 4205100, 'SC'),
    (4393, 'Doutor Pedrinho', 4205159, 'SC'),
    (4394, 'Entre Rios', 4205175, 'SC'),
    (4395, 'Ermo', 4205191, 'SC'),
    (4396, 'Erval Velho', 4205209, 'SC'),
    (4397, 'Faxinal dos Guedes', 4205308, 'SC'),
    (4398, 'Flor do Sertão', 4205357, 'SC'),
    (4399, 'Florianópolis', 4205407, 'SC'),
    (4400, 'Formosa do Sul', 4205431, 'SC'),
    (4401, 'Forquilhinha', 4205456, 'SC'),
    (4402, 'Fraiburgo', 4205506, 'SC'),
    (4403, 'Frei Rogério', 4205555, 'SC'),
    (4404, 'Galvão', 4205605, 'SC'),
    (4405, 'Garopaba', 4205704, 'SC'),
    (4406, 'Garuva', 4205803, 'SC'),
    (4407, 'Gaspar', 4205902, 'SC'),
    (4408, 'Governador Celso Ramos', 4206009, 'SC'),
    (4409, 'Grão Pará', 4206108, 'SC'),
    (4410, 'Gravatal', 4206207, 'SC'),
    (4411, 'Guabiruba', 4206306, 'SC'),
    (4412, 'Guaraciaba', 4206405, 'SC'),
    (4413, 'Guaramirim', 4206504, 'SC'),
    (4414, 'Guarujá do Sul', 4206603, 'SC'),
    (4415, 'Guatambú', 4206652, 'SC'),
    (4417, 'Ibiam', 4206751, 'SC'),
    (4418, 'Ibicaré', 4206801, 'SC'),
    (4419, 'Ibirama', 4206900, 'SC'),
    (4420, 'Içara', 4207007, 'SC'),
    (4421, 'Ilhota', 4207106, 'SC'),
    (4422, 'Imaruí', 4207205, 'SC'),
    (4423, 'Imbituba', 4207304, 'SC'),
    (4424, 'Imbuia', 4207403, 'SC'),
    (4425, 'Indaial', 4207502, 'SC'),
    (4426, 'Iomerê', 4207577, 'SC'),
    (4427, 'Ipira', 4207601, 'SC'),
    (4428, 'Iporã do Oeste', 4207650, 'SC'),
    (4429, 'Ipuaçu', 4207684, 'SC'),
    (4430, 'Ipumirim', 4207700, 'SC'),
    (4431, 'Iraceminha', 4207759, 'SC'),
    (4432, 'Irani', 4207809, 'SC'),
    (4433, 'Irati', 4207858, 'SC'),
    (4434, 'Irineópolis', 4207908, 'SC'),
    (4435, 'Itá', 4208005, 'SC'),
    (4436, 'Itaiópolis', 4208104, 'SC'),
    (4437, 'Itajaí', 4208203, 'SC'),
    (4438, 'Itapema', 4208302, 'SC'),
    (4439, 'Itapiranga', 4208401, 'SC'),
    (4440, 'Itapoá', 4208450, 'SC'),
    (4441, 'Ituporanga', 4208500, 'SC'),
    (4442, 'Jaborá', 4208609, 'SC'),
    (4443, 'Jacinto Machado', 4208708, 'SC'),
    (4444, 'Jaguaruna', 4208807, 'SC'),
    (4445, 'Jaraguá do Sul', 4208906, 'SC'),
    (4446, 'Jardinópolis', 4208955, 'SC'),
    (4447, 'Joaçaba', 4209003, 'SC'),
    (4448, 'Joinville', 4209102, 'SC'),
    (4449, 'José Boiteux', 4209151, 'SC'),
    (4450, 'Jupiá', 4209177, 'SC'),
    (4451, 'Lacerdópolis', 4209201, 'SC'),
    (4452, 'Lages', 4209300, 'SC'),
    (4453, 'Laguna', 4209409, 'SC'),
    (4454, 'Lajeado Grande', 4209458, 'SC'),
    (4455, 'Laurentino', 4209508, 'SC'),
    (4456, 'Lauro Muller', 4209607, 'SC'),
    (4457, 'Lebon Régis', 4209706, 'SC'),
    (4458, 'Leoberto Leal', 4209805, 'SC'),
    (4459, 'Lindóia do Sul', 4209854, 'SC'),
    (4460, 'Lontras', 4209904, 'SC'),
    (4461, 'Luiz Alves', 4210001, 'SC'),
    (4462, 'Luzerna', 4210035, 'SC'),
    (4463, 'Macieira', 4210050, 'SC'),
    (4464, 'Mafra', 4210100, 'SC'),
    (4465, 'Major Gercino', 4210209, 'SC'),
    (4466, 'Major Vieira', 4210308, 'SC'),
    (4467, 'Maracajá', 4210407, 'SC'),
    (4468, 'Maravilha', 4210506, 'SC'),
    (4469, 'Marema', 4210555, 'SC'),
    (4470, 'Massaranduba', 4210605, 'SC'),
    (4471, 'Matos Costa', 4210704, 'SC'),
    (4472, 'Meleiro', 4210803, 'SC'),
    (4473, 'Mirim Doce', 4210852, 'SC'),
    (4474, 'Modelo', 4210902, 'SC'),
    (4475, 'Mondaí', 4211009, 'SC'),
    (4476, 'Monte Carlo', 4211058, 'SC'),
    (4477, 'Monte Castelo', 4211108, 'SC'),
    (4478, 'Morro da Fumaça', 4211207, 'SC'),
    (4479, 'Morro Grande', 4211256, 'SC'),
    (4480, 'Navegantes', 4211306, 'SC'),
    (4481, 'Nova Erechim', 4211405, 'SC'),
    (4482, 'Nova Itaberaba', 4211454, 'SC'),
    (4483, 'Nova Trento', 4211504, 'SC'),
    (4484, 'Nova Veneza', 4211603, 'SC'),
    (4485, 'Novo Horizonte', 4211652, 'SC'),
    (4486, 'Orleans', 4211702, 'SC'),
    (4487, 'Otacílio Costa', 4211751, 'SC'),
    (4488, 'Ouro', 4211801, 'SC'),
    (4489, 'Ouro Verde', 4211850, 'SC'),
    (4490, 'Paial', 4211876, 'SC'),
    (4491, 'Painel', 4211892, 'SC'),
    (4492, 'Palhoça', 4211900, 'SC'),
    (4493, 'Palma Sola', 4212007, 'SC'),
    (4494, 'Palmeira', 4212056, 'SC'),
    (4495, 'Palmitos', 4212106, 'SC'),
    (4496, 'Papanduva', 4212205, 'SC'),
    (4497, 'Paraíso', 4212239, 'SC'),
    (4498, 'Passo de Torres', 4212254, 'SC'),
    (4499, 'Passos Maia', 4212270, 'SC'),
    (4500, 'Paulo Lopes', 4212304, 'SC'),
    (4501, 'Pedras Grandes', 4212403, 'SC'),
    (4502, 'Penha', 4212502, 'SC'),
    (4503, 'Peritiba', 4212601, 'SC'),
    (4504, 'Pescaria Brava', 4212650, 'SC'),
    (4505, 'Petrolândia', 4212700, 'SC'),
    (4506, 'Balneário Piçarras', 4212809, 'SC'),
    (4507, 'Pinhalzinho', 4212908, 'SC'),
    (4508, 'Pinheiro Preto', 4213005, 'SC'),
    (4509, 'Piratuba', 4213104, 'SC'),
    (4510, 'Planalto Alegre', 4213153, 'SC'),
    (4511, 'Pomerode', 4213203, 'SC'),
    (4512, 'Ponte Alta', 4213302, 'SC'),
    (4513, 'Ponte Alta do Norte', 4213351, 'SC'),
    (4514, 'Ponte Serrada', 4213401, 'SC'),
    (4515, 'Porto Belo', 4213500, 'SC'),
    (4516, 'Porto União', 4213609, 'SC'),
    (4517, 'Pouso Redondo', 4213708, 'SC'),
    (4518, 'Praia Grande', 4213807, 'SC'),
    (
        4519,
        'Presidente Castello Branco',
        4213906,
        'SC'
    ),
    (4520, 'Presidente Getúlio', 4214003, 'SC'),
    (4521, 'Presidente Nereu', 4214102, 'SC'),
    (4522, 'Princesa', 4214151, 'SC'),
    (4523, 'Quilombo', 4214201, 'SC'),
    (4524, 'Rancho Queimado', 4214300, 'SC'),
    (4525, 'Rio das Antas', 4214409, 'SC'),
    (4526, 'Rio do Campo', 4214508, 'SC'),
    (4527, 'Rio do Oeste', 4214607, 'SC'),
    (4528, 'Rio dos Cedros', 4214706, 'SC'),
    (4529, 'Rio do Sul', 4214805, 'SC'),
    (4530, 'Rio Fortuna', 4214904, 'SC'),
    (4531, 'Rio Negrinho', 4215000, 'SC'),
    (4532, 'Rio Rufino', 4215059, 'SC'),
    (4533, 'Riqueza', 4215075, 'SC'),
    (4534, 'Rodeio', 4215109, 'SC'),
    (4535, 'Romelândia', 4215208, 'SC'),
    (4536, 'Salete', 4215307, 'SC'),
    (4537, 'Saltinho', 4215356, 'SC'),
    (4538, 'Salto Veloso', 4215406, 'SC'),
    (4539, 'Sangão', 4215455, 'SC'),
    (4540, 'Santa Cecília', 4215505, 'SC'),
    (4541, 'Santa Helena', 4215554, 'SC'),
    (4542, 'Santa Rosa de Lima', 4215604, 'SC'),
    (4543, 'Santa Rosa do Sul', 4215653, 'SC'),
    (4544, 'Santa Terezinha', 4215679, 'SC'),
    (
        4545,
        'Santa Terezinha do Progresso',
        4215687,
        'SC'
    ),
    (4546, 'Santiago do Sul', 4215695, 'SC'),
    (4547, 'Santo Amaro da Imperatriz', 4215703, 'SC'),
    (4548, 'São Bernardino', 4215752, 'SC'),
    (4549, 'São Bento do Sul', 4215802, 'SC'),
    (4550, 'São Bonifácio', 4215901, 'SC'),
    (4551, 'São Carlos', 4216008, 'SC'),
    (4552, 'São Cristovão do Sul', 4216057, 'SC'),
    (4553, 'São Domingos', 4216107, 'SC'),
    (4554, 'São Francisco do Sul', 4216206, 'SC'),
    (4555, 'São João do Oeste', 4216255, 'SC'),
    (4556, 'São João Batista', 4216305, 'SC'),
    (4557, 'São João do Itaperiú', 4216354, 'SC'),
    (4558, 'São João do Sul', 4216404, 'SC'),
    (4559, 'São Joaquim', 4216503, 'SC'),
    (4560, 'São José', 4216602, 'SC'),
    (4561, 'São José do Cedro', 4216701, 'SC'),
    (4562, 'São José do Cerrito', 4216800, 'SC'),
    (4563, 'São Lourenço do Oeste', 4216909, 'SC'),
    (4564, 'São Ludgero', 4217006, 'SC'),
    (4565, 'São Martinho', 4217105, 'SC'),
    (4566, 'São Miguel da Boa Vista', 4217154, 'SC'),
    (4567, 'São Miguel do Oeste', 4217204, 'SC'),
    (4568, 'São Pedro de Alcântara', 4217253, 'SC'),
    (4569, 'Saudades', 4217303, 'SC'),
    (4570, 'Schroeder', 4217402, 'SC'),
    (4571, 'Seara', 4217501, 'SC'),
    (4572, 'Serra Alta', 4217550, 'SC'),
    (4573, 'Siderópolis', 4217600, 'SC'),
    (4574, 'Sombrio', 4217709, 'SC'),
    (4575, 'Sul Brasil', 4217758, 'SC'),
    (4576, 'Taió', 4217808, 'SC'),
    (4577, 'Tangará', 4217907, 'SC'),
    (4578, 'Tigrinhos', 4217956, 'SC'),
    (4579, 'Tijucas', 4218004, 'SC'),
    (4580, 'Timbé do Sul', 4218103, 'SC'),
    (4581, 'Timbó', 4218202, 'SC'),
    (4582, 'Timbó Grande', 4218251, 'SC'),
    (4583, 'Três Barras', 4218301, 'SC'),
    (4584, 'Treviso', 4218350, 'SC'),
    (4585, 'Treze de Maio', 4218400, 'SC'),
    (4586, 'Treze Tílias', 4218509, 'SC'),
    (4587, 'Trombudo Central', 4218608, 'SC'),
    (4588, 'Tubarão', 4218707, 'SC'),
    (4589, 'Tunápolis', 4218756, 'SC'),
    (4590, 'Turvo', 4218806, 'SC'),
    (4591, 'União do Oeste', 4218855, 'SC'),
    (4592, 'Urubici', 4218905, 'SC'),
    (4593, 'Urupema', 4218954, 'SC'),
    (4594, 'Urussanga', 4219002, 'SC'),
    (4595, 'Vargeão', 4219101, 'SC'),
    (4596, 'Vargem', 4219150, 'SC'),
    (4597, 'Vargem Bonita', 4219176, 'SC'),
    (4598, 'Vidal Ramos', 4219200, 'SC'),
    (4599, 'Videira', 4219309, 'SC'),
    (4600, 'Vitor Meireles', 4219358, 'SC'),
    (4601, 'Witmarsum', 4219408, 'SC'),
    (4602, 'Xanxerê', 4219507, 'SC'),
    (4603, 'Xavantina', 4219606, 'SC'),
    (4604, 'Xaxim', 4219705, 'SC'),
    (4605, 'Zortéa', 4219853, 'SC'),
    (4606, 'Balneário Rincão', 4220000, 'SC'),
    (4416, 'Herval d Oeste', 4206702, 'SC') on conflict (municipio_ibge) do nothing;

insert into
    t_user_type (user_type_name)
values
    ('Cidadão'),
    ('Administrador'),
    ('DMER'),
    ('DOSU') on conflict (user_type_name) do nothing;

insert into
    t_ocorrencia_status (ocorrencia_status_nome)
values
    ('Aberto'),
    ('Em Análise'),
    ('Em Andamento'),
    ('Resolvido'),
    ('Fechado') on conflict (ocorrencia_status_nome) do nothing;

insert into
    t_ocorrencia_prioridade (ocorrencia_prioridade_nome)
values
    ('Baixa'),
    ('Normal'),
    ('Alta'),
    ('Urgente') on conflict (ocorrencia_prioridade_nome) do nothing;

commit;