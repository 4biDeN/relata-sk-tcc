const locaisService = require('../services/localServices');

const createLocal = async (req, res) => {
    try {
        const local = req.body;
        const requiredFields = [
            'local_municipio_id', 'local_estado', 'local_bairro', 'local_rua'
        ];
        for (const field of requiredFields) {
            if (!local[field]) {
                return res.status(400).json({ error: `Campo ${field} é obrigatório.`});
            }
        }
        res.status(201).json( { message: 'Local criado com sucesso.'});
    } catch (error) {
        console.error('Erro ao criar local:', error);
        res.status(500).json({ error: 'Erro ao criar local.'});
    };
};

const updateLocal = async (req, res) => {
    try {
        const { local_id } = req.params;
        if (!local_id) {
            return res.status(400).json({ error: "ID do local é obrigatório." });
        };
        const updatedLocal = await locaisService.updateLocal(local_id, req.body);
        if (!updatedLocal) {
            return res.status(404).json({ error: "Local não encontrado." });
        };
        res.status(200).json({ message: "Local atualizado com sucesso."});
    } catch (error) {
        console.error('Erro ao atualizar local:', error);
        res.status(500).json({ error: 'Erro ao atualizar local.' });
    };
};

const getLocais = async (req, res) => {
    try {
        const locais = await locaisService.getLocais();
        res.status(200).json(locais);
    } catch (error) {
        console.error('Erro ao buscar locais:', error);
        res.status(500).json({ error: 'Erro ao buscar locais.' });
    };
};

const getLocalById = async (req, res) => {
    try {
        const { local_id } = req.params;
        if (!local_id) {
            return res.status(400).json({ error: "ID do local é obrigatório." });
        }
        const local = await locaisService.getLocalById(local_id);
        if (!local) {
            return res.status(404).json({ error: "Local não encontado." });
        }
        res.status(200).json(local);
    } catch (error) {
        console.error('Erro ao buscar local por ID:', error);
        res.status(500).json({ error: 'Erro ao buscar local por ID.' });
    };
};

const searchLocais = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) {
            return res.status(400).json({ error: "Parâmetros para a busca não informados."});
        }
        const locais = await locaisService.searchLocais(query);
        if (!locais.length) {
            return res.status(404).json({ error: "Nenhum local encontrado."});
        }
        res.status(200).json(locais);
    } catch (error) { 
        console.error('Erro ao buscar locais:', error);
        res.status(500).json({ error: 'Erro ao buscar locais.' });
    }
};

module.exports = {
    createLocal,
    updateLocal,
    getLocais,
    getLocalById,
    searchLocais
}