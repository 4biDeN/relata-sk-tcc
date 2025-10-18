const ocorrenciaHistoricoService = require("../services/ocorrenciaHistoricoService");

const createOcorrenciaHistorico = async (req, res) => {
    try {
        const userId = Number(req.user?.sub);
        const body = {
            ocorrencia_id: Number(req.params.ocorrencia_id ?? req.body.ocorrencia_id),
            acao: req.body.acao,
            entidade: req.body.entidade,
            campo: req.body.campo ?? null,
            valor_anterior: req.body.valor_anterior ?? null,
            valor_novo: req.body.valor_novo ?? null,
            entidade_id: req.body.entidade_id ? Number(req.body.entidade_id) : null,
            changed_at: req.body.changed_at ? new Date(req.body.changed_at) : null,
            meta: req.body.meta ?? {},
        };

        if (
            !Number.isInteger(body.ocorrencia_id) ||
            typeof body.acao !== "string" ||
            typeof body.entidade !== "string" ||
            !Number.isInteger(userId)
        ) {
            return res.status(400).json({ message: "Parâmetros inválidos" });
        }

        const created = await ocorrenciaHistoricoService.appendOcorrenciaHistorico(body, { userId });
        if (!created) return res.status(200).json({ skipped: true });
        return res.status(201).json(created);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

const getOcorrenciaHistoricoByOcorrencia = async (req, res) => {
    try {
        const ocorrencia_id = Number(req.params.ocorrencia_id);
        const limit = req.query.limit ? Number(req.query.limit) : 20;
        const offset = req.query.offset ? Number(req.query.offset) : 0;

        if (!Number.isInteger(ocorrencia_id)) {
            return res.status(400).json({ message: "Parâmetros inválidos" });
        }

        const { rows, total } =
            await ocorrenciaHistoricoService.getOcorrenciaHistoricoByOcorrencia(
                ocorrencia_id,
                limit,
                offset
            );

        return res.json({ rows, total });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

const updateOcorrenciaHistorico = async (req, res) => {
    try {
        const userId = Number(req.user?.sub);
        const id = Number(req.params.id);
        const data = {};

        if (req.body.ocorrencia_id !== undefined) data.ocorrencia_id = Number(req.body.ocorrencia_id);
        if (req.body.acao !== undefined) data.acao = req.body.acao;
        if (req.body.entidade !== undefined) data.entidade = req.body.entidade;
        if (req.body.campo !== undefined) data.campo = req.body.campo;
        if (req.body.valor_anterior !== undefined) data.valor_anterior = req.body.valor_anterior;
        if (req.body.valor_novo !== undefined) data.valor_novo = req.body.valor_novo;
        if (req.body.entidade_id !== undefined) data.entidade_id = Number(req.body.entidade_id);
        if (req.body.changed_at !== undefined) data.changed_at = new Date(req.body.changed_at);
        if (req.body.meta !== undefined) data.meta = req.body.meta;

        if (!Number.isInteger(id) || !Number.isInteger(userId)) {
            return res.status(400).json({ message: "Parâmetros inválidos" });
        }

        const updated = await ocorrenciaHistoricoService.updateOcorrenciaHistorico(id, data, { userId });

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

const deleteOcorrenciaHistorico = async (req, res) => {
    try {
        const userId = Number(req.user?.sub);
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || !Number.isInteger(userId)) {
            return res.status(400).json({ message: "Parâmetros inválidos" });
        }
        await ocorrenciaHistoricoService.deleteOcorrenciaHistorico(id, { userId });
        return res.status(204).send();
    } catch (err) {
        if (err.message === "Registro não encontrado") {
            return res.status(404).json({ message: err.message });
        }
        return res.status(500).json({ message: err.message });
    }
};

module.exports = {
    createOcorrenciaHistorico,
    getOcorrenciaHistoricoByOcorrencia,
    updateOcorrenciaHistorico,
    deleteOcorrenciaHistorico,
};
