const ocorrenciaComentarioService = require("../services/ocorrenciaComentarioService");

const createOcorrenciaComentario = async (req, res) => {
    try {
        const userId = Number(req.user?.sub);

        const body = {
            comentario_ocorrencia_id: Number(req.params.ocorrencia_id ?? req.body.comentario_ocorrencia_id),
            comentario_texto: req.body.comentario_texto,
            comentario_excluido: req.body.comentario_excluido ?? null,
        };

        if (
            !Number.isInteger(body.comentario_ocorrencia_id) ||
            !Number.isInteger(userId) ||
            typeof body.comentario_texto !== "string"
        ) {
            return res.status(400).json({ message: "Parâmetros inválidos" });
        }

        const created = await ocorrenciaComentarioService.createComentario(
            {
                ...body,
                comentario_user_id: userId,
            },
            { userId }
        );

        return res.status(201).json(created);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

const getComentariosByOcorrencia = async (req, res) => {
    try {
        const ocorrencia_id = Number(req.params.ocorrencia_id);
        const limit = req.query.limit ? Number(req.query.limit) : 20;
        const offset = req.query.offset ? Number(req.query.offset) : 0;
        const includeExcluidos =
            typeof req.query.includeExcluidos === "string"
                ? ["1", "true", "t", "yes"].includes(req.query.includeExcluidos.toLowerCase())
                : false;
        const before = req.query.before ? new Date(req.query.before) : null;

        if (!Number.isInteger(ocorrencia_id) || Number.isNaN(limit) || Number.isNaN(offset)) {
            return res.status(400).json({ message: "Parâmetros inválidos" });
        }

        const { rows, total } = await ocorrenciaComentarioService.getComentariosByOcorrencia(
            ocorrencia_id,
            { includeExcluidos, limit, offset, before }
        );

        return res.json({ rows, total });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

const getComentarioById = async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id)) {
            return res.status(400).json({ message: "Parâmetros inválidos" });
        }

        const row = await ocorrenciaComentarioService.getComentarioById(id);
        if (!row) {
            return res.status(404).json({ message: "Registro não encontrado" });
        }
        return res.json(row);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

const updateOcorrenciaComentario = async (req, res) => {
    try {
        const userId = Number(req.user?.sub);
        const id = Number(req.params.id);
        const data = {};

        if (req.body.comentario_texto !== undefined) data.comentario_texto = req.body.comentario_texto;
        if (req.body.comentario_data !== undefined) data.comentario_data = new Date(req.body.comentario_data);
        if (req.body.comentario_excluido !== undefined) data.comentario_excluido = !!req.body.comentario_excluido;

        if (!Number.isInteger(id) || !Number.isInteger(userId)) {
            return res.status(400).json({ message: "Parâmetros inválidos" });
        }

        const updated = await ocorrenciaComentarioService.updateComentario(id, data, { userId });
        if (!updated) {
            return res.status(400).json({ message: "Nada para atualizar" });
        }

        return res.json(updated);
    } catch (err) {
        if (err.message === "Registro não encontrado") {
            return res.status(404).json({ message: err.message });
        }
        return res.status(500).json({ message: err.message });
    }
};

const softDeleteOcorrenciaComentario = async (req, res) => {
    try {
        const userId = Number(req.user?.sub);
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || !Number.isInteger(userId)) {
            return res.status(400).json({ message: "Parâmetros inválidos" });
        }

        const updated = await ocorrenciaComentarioService.softDeleteComentario(id, { userId });
        if (!updated) {
            return res.status(404).json({ message: "Registro não encontrado" });
        }
        return res.json(updated);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

const deleteOcorrenciaComentario = async (req, res) => {
    try {
        const userId = Number(req.user?.sub);
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || !Number.isInteger(userId)) {
            return res.status(400).json({ message: "Parâmetros inválidos" });
        }
        await ocorrenciaComentarioService.deleteComentario(id, { userId });
        return res.status(204).send();
    } catch (err) {
        if (err.message === "Registro não encontrado") {
            return res.status(404).json({ message: err.message });
        }
        return res.status(500).json({ message: err.message });
    }
};

module.exports = {
    createOcorrenciaComentario,
    getComentariosByOcorrencia,
    getComentarioById,
    updateOcorrenciaComentario,
    softDeleteOcorrenciaComentario,
    deleteOcorrenciaComentario,
};
