const locaisController = require("../controllers/localController");
const requireAuth = require("../auth/requireAuth");

module.exports = (app) => {
  app.post(
    "/local",
    requireAuth,
    locaisController.createLocal
    /*
        #swagger.tags = ["Locais"]
        #swagger.summary = "Cria um novo local"
        #swagger.description = 'Cria um novo local com os dados fornecidos.'

        #swagger.parameters['body'] = {
            in: 'body',
            description: 'Dados do novo local',
            required: true,
            schema: {
                local_municipio_id: 4569,
                local_estado: "SC",
                local_municipio: "Saudades",
                local_bairro: "Centro",
                local_rua: "Rua das Flores",
                local_complemento: "Próximo à praça",
                local_latitude: -26.9311,
                local_longitude: -53.0025
            }
        }

        #swagger.responses[201] = {
            description: 'Local criado com sucesso',
            schema: {
                message: 'Local criado com sucesso.',
                local: {
                    local_id: 10,
                    local_municipio_id: 4569,
                    local_estado: "SC",
                    local_bairro: "Centro",
                    local_rua: "Rua das Flores",
                    local_complemento: "Próximo à praça",
                    local_latitude: -26.9311,
                    local_longitude: -53.0025
                }
            }
        }

        #swagger.responses[400] = {
            description: 'Dados inválidos',
            schema: {
                error: 'Campo local_municipio_id é obrigatório.'
            }
        }

        #swagger.responses[500] = {
            description: 'Erro interno do servidor',
            schema: {
                error: 'Erro ao criar local.'
            }
        }
    */
  );

  app.get(
    "/locais",
    requireAuth,
    locaisController.getLocais
    /*
        #swagger.tags = ["Locais"]
        #swagger.summary = "Lista todos os locais"
        #swagger.description = 'Retorna uma lista de todos os locais cadastrados.'

        #swagger.responses[200] = {
            description: 'Lista de locais',
            schema: [
                {
                    local_id: 10,
                    local_estado: "SC",
                    local_municipio: "Saudades",
                    local_bairro: "Centro",
                    local_rua: "Rua das Flores"
                }
            ]
        }

        #swagger.responses[401] = {
            description: 'Não autorizado',
            schema: {
                error: 'Token inválido ou ausente'
            }
        }

        #swagger.responses[500] = {
            description: 'Erro interno do servidor',
            schema: {
                error: 'Erro ao buscar locais.'
            }
        }
    */
  );

  app.get(
    "/local/:local_id",
    requireAuth,
    locaisController.getLocalById
    /*
        #swagger.tags = ["Locais"]
        #swagger.summary = "Obtém um local pelo ID"
        #swagger.description = 'Retorna os dados de um local específico com base no ID fornecido.'

        #swagger.parameters['local_id'] = {
            in: 'path',
            description: 'ID do local a ser buscado',
            required: true,
            type: 'integer',
            example: 10
        }

        #swagger.responses[200] = {
            description: 'Dados do local',
            schema: {
                local_id: 10,
                local_estado: "SC",
                local_municipio: "Saudades",
                local_bairro: "Centro",
                local_rua: "Rua das Flores"
            }
        }

        #swagger.responses[400] = {
            description: 'ID do local não informado',
            schema: {
                error: 'ID do local é obrigatório.'
            }
        }

        #swagger.responses[404] = {
            description: 'Local não encontrado',
            schema: {
                error: 'Local não encontrado.'
            }
        }

        #swagger.responses[500] = {
            description: 'Erro interno do servidor',
            schema: {
                error: 'Erro ao buscar local por ID.'
            }
        }
    */
  );

  app.get(
    "/locais/search",
    requireAuth,
    locaisController.searchLocais
    /*
        #swagger.tags = ["Locais"]
        #swagger.summary = "Busca locais por termo"
        #swagger.description = 'Busca locais por cidade, bairro ou rua.'

        #swagger.parameters['query'] = {
            in: 'query',
            description: 'Termo de busca (cidade, bairro ou rua)',
            required: true,
            type: 'string',
            example: 'Centro'
        }

        #swagger.responses[200] = {
            description: 'Locais encontrados',
            schema: [
                {
                    local_id: 10,
                    local_estado: "SC",
                    local_municipio: "Saudades",
                    local_bairro: "Centro",
                    local_rua: "Rua das Flores"
                }
            ]
        }

        #swagger.responses[400] = {
            description: 'Parâmetro de busca não informado',
            schema: {
                error: 'Parâmetros para a busca não informados.'
            }
        }

        #swagger.responses[404] = {
            description: 'Nenhum local encontrado',
            schema: {
                error: 'Nenhum local encontrado.'
            }
        }

        #swagger.responses[500] = {
            description: 'Erro interno do servidor',
            schema: {
                error: 'Erro ao buscar locais.'
            }
        }
    */
  );

  app.put(
    "/local/:local_id",
    requireAuth,
    locaisController.updateLocal
    /*
        #swagger.tags = ["Locais"]
        #swagger.summary = "Atualiza um local existente"
        #swagger.description = 'Atualiza um local existente com base no ID fornecido.'

        #swagger.parameters['local_id'] = {
            in: 'path',
            description: 'ID do local a ser atualizado',
            required: true,
            type: 'integer',
            example: 10
        }

        #swagger.parameters['body'] = {
            in: 'body',
            description: 'Dados do local a serem atualizados',
            required: true,
            schema: {
                local_estado: "SC",
                local_municipio_id: 4569,
                local_bairro: "Centro",
                local_rua: "Rua Nova",
                local_complemento: "Ao lado do mercado"
            }
        }

        #swagger.responses[200] = {
            description: 'Local atualizado com sucesso',
            schema: {
                message: 'Local atualizado com sucesso.',
                local: { local_id: 10, local_estado: "SC", local_municipio: "Saudades", local_bairro: "Centro", local_rua: "Rua Nova" }
            }
        }

        #swagger.responses[400] = {
            description: 'ID do local não informado',
            schema: {
                error: 'ID do local é obrigatório.'
            }
        }

        #swagger.responses[404] = {
            description: 'Local não encontrado',
            schema: {
                error: 'Local não encontrado.'
            }
        }

        #swagger.responses[500] = {
            description: 'Erro interno do servidor',
            schema: {
                error: 'Erro ao atualizar local.'
            }
        }
    */
  );

  app.delete(
    "/local/:local_id",
    requireAuth,
    locaisController.deleteLocal
    /*
        #swagger.tags = ["Locais"]
        #swagger.summary = "Exclui (soft delete) um local existente"
        #swagger.description = 'Marca o local como excluído no sistema, sem removê-lo fisicamente do banco de dados.'

        #swagger.parameters['local_id'] = {
            in: 'path',
            description: 'ID do local a ser excluído',
            required: true,
            type: 'integer',
            example: 10
        }

        #swagger.responses[200] = {
            description: 'Local excluído com sucesso',
            schema: {
                message: 'Local excluído com sucesso.'
            }
        }

        #swagger.responses[400] = {
            description: 'ID do local não informado',
            schema: {
                error: 'ID do local é obrigatório.'
            }
        }

        #swagger.responses[404] = {
            description: 'Local não encontrado',
            schema: {
                error: 'Local não encontrado.'
            }
        }

        #swagger.responses[500] = {
            description: 'Erro interno do servidor',
            schema: {
                error: 'Erro ao excluir local.'
            }
        }
    */
  );
};
