-- Criação da tabela de usuários
CREATE TABLE t_usuario (
    user_id SERIAL PRIMARY KEY,
    user_username TEXT NOT NULL,
    user_email TEXT NOT NULL,
    user_documento VARCHAR(11) UNIQUE NOT NULL,
    user_password TEXT NOT NULL,
    user_salt TEXT NOT NULL,
    user_token_version INTEGER,
    user_tipo INTEGER DEFAULT 1
);

-- Criação da tabela de tipo de usuário
CREATE TABLE t_user_type (
    user_type_id SERIAL PRIMARY KEY,
    user_type_name TEXT NOT NULL
);

-- Criação da tabela de reclamações
CREATE TABLE t_reclamacao (
    reclamacao_id SERIAL PRIMARY KEY,
    reclamacao_user_id INTEGER NOT NULL,
    reclamacao_titulo TEXT NOT NULL,
    reclamacao_descricao TEXT NOT NULL,
    reclamacao_data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reclamacao_status INTEGER NOT NULL DEFAULT 1
);

-- Criação da tabela de status de reclamação
CREATE TABLE t_reclamacao_status (
    reclamacao_status_id SERIAL PRIMARY KEY,
    reclamacao_status_nome TEXT NOT NULL
);

-- Criação da tabela de imagens de reclamação
CREATE TABLE t_reclamacao_imagem (
    reclamacao_imagem_id SERIAL PRIMARY KEY,
    reclamacao_imagem_url TEXT NOT NULL,
    reclamacao_id INTEGER NOT NULL
);

-- Criação das constraints de chave estrangeira --
ALTER TABLE t_usuario
ADD CONSTRAINT fk_user_tipo
FOREIGN KEY (user_tipo) REFERENCES t_user_type(user_type_id);

ALTER TABLE t_reclamacao
ADD CONSTRAINT fk_reclamacao_user
FOREIGN KEY (reclamacao_user_id) REFERENCES t_usuario(user_id);

ALTER TABLE t_reclamacao
ADD CONSTRAINT fk_reclamacao_status
FOREIGN KEY (reclamacao_status) REFERENCES t_reclamacao_status(reclamacao_status_id);

ALTER TABLE t_reclamacao_imagem
ADD CONSTRAINT fk_reclamacao_imagem
FOREIGN KEY (reclamacao_id) REFERENCES t_reclamacao(reclamacao_id)
ON DELETE CASCADE;

INSERT INTO t_user_type (user_type_name) VALUES
('Cidadão'),
('Administrador');