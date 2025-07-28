CREATE TABLE t_user (
    user_id SERIAL PRIMARY KEY,
    user_username TEXT NOT NULL,
    user_email TEXT UNIQUE NOT NULL,
    user_documento VARCHAR(11) NOT NULL,
    user_password TEXT NOT NULL,
    user_salt TEXT NOT NULL,
    user_tipo VARCHAR(20) NOT NULL CHECK (user_tipo IN ('cidadao', 'gestor'))
);

