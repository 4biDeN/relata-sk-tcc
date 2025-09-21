const ocorrenciaController = require("../controllers/ocorrenciaController");
const requireAuth = require("../auth/requireAuth");

module.exports = (app) => {
  app.post(
    "/ocorrencias",
    requireAuth,
    ocorrenciaController.createOcorrencia
    /*
    #swagger.tags = ['Ocorrências']
    #swagger.summary = 'Criar uma nova ocorrência'
    #swagger.description = 'Registra uma ocorrência vinculada a um local e opcionalmente a um usuário autenticado.'

    #swagger.parameters['body'] = {
        in: 'body',
        description: 'Dados da ocorrência',
        required: true,
        schema: {
            ocorrencia_user_id: 1,
            ocorrencia_anonima: false,
            ocorrencia_titulo: "Buraco na rua",
            ocorrencia_descricao: "Existe um buraco grande na Rua das Flores",
            ocorrencia_prioridade: 2,
            local: {
                local_municipio_id: 4569,
                local_estado: "SC",
                local_bairro: "Centro",
                local_rua: "Rua das Flores",
                local_complemento: "Próximo ao mercado",
                local_latitude: -27.1362,
                local_longitude: -53.0022
            }
        }
    }

    #swagger.responses[201] = {
        description: 'Ocorrência criada com sucesso',
        schema: {
            ocorrencia_id: 10,
            ocorrencia_protocolo: "2025-000010",
            ocorrencia_titulo: "Buraco na rua",
            ocorrencia_descricao: "Existe um buraco grande na Rua das Flores"
        }
    }

    #swagger.responses[422] = {
        description: 'Falha de validação',
        schema: {
            message: 'Validação falhou',
            errors: [
                "ocorrencia_titulo é obrigatório",
                "local.local_municipio_id, local.local_estado, local.local_bairro e local.local_rua são obrigatórios"
            ]
        }
    }

    #swagger.responses[409] = {
        description: 'Conflito de dados',
        schema: {
            message: 'Conflito de dados',
            detail: 'Descrição do conflito'
        }
    }

    #swagger.responses[401] = {
        description: 'Não autorizado',
        schema: { message: 'Token de autenticação inválido ou ausente' }
    }

    #swagger.responses[500] = {
        description: 'Erro interno do servidor',
        schema: { message: 'Erro ao criar ocorrência', detail: 'Descrição do erro' }
    }
*/
  );

  app.get(
    "/ocorrencias/search",
    requireAuth,
    ocorrenciaController.searchOcorrenciaByFieldValue
    /*
    #swagger.tags = ['Ocorrências']
    #swagger.summary = 'Busca dinâmica de ocorrências'
    #swagger.description = 'Filtra por status, prioridade, título ou descrição, com ordenação e paginação.'

    #swagger.parameters['field'] = {
        in: 'query',
        description: 'Campo de filtro (status|prioridade|titulo|descricao)',
        required: false,
        type: 'string',
        example: 'status'
    }
    #swagger.parameters['value'] = {
        in: 'query',
        description: 'Valor do filtro. Para status/prioridade usar o ID; para titulo/descricao usar texto.',
        required: false,
        type: 'string',
        example: '1'
    }
    #swagger.parameters['orderField'] = {
        in: 'query',
        description: 'Campo de ordenação (data|status|prioridade|titulo)',
        required: false,
        type: 'string',
        example: 'data'
    }
    #swagger.parameters['orderDir'] = {
        in: 'query',
        description: 'Direção da ordenação (asc|desc)',
        required: false,
        type: 'string',
        example: 'desc'
    }
    #swagger.parameters['limit'] = {
        in: 'query',
        description: 'Quantidade de registros por página',
        required: false,
        type: 'integer',
        example: 10
    }
    #swagger.parameters['offset'] = {
        in: 'query',
        description: 'Quantidade de registros a pular (paginações subsequentes)',
        required: false,
        type: 'integer',
        example: 0
    }

    #swagger.responses[200] = {
        description: 'Lista de ocorrências',
        schema: [
            {
                ocorrencia_id: 10,
                ocorrencia_protocolo: "2025-000010",
                ocorrencia_titulo: "Buraco na rua",
                ocorrencia_descricao: "Existe um buraco grande na Rua das Flores",
                status: "Aberta",
                prioridade: "Alta",
                ocorrencia_data: "2025-09-02T15:25:00.000Z",
                ocorrencia_anonima: false
            }
        ]
    }

    #swagger.responses[400] = {
        description: 'Parâmetros inválidos',
        schema: { message: 'Campo de filtro inválido' }
    }

    #swagger.responses[404] = {
        description: 'Nenhuma ocorrência encontrada',
        schema: { message: 'Nenhuma ocorrência encontrada' }
    }

    #swagger.responses[401] = {
        description: 'Não autorizado',
        schema: { message: 'Token de autenticação inválido ou ausente' }
    }

    #swagger.responses[500] = {
        description: 'Erro interno do servidor',
        schema: { message: 'Erro ao buscar ocorrências', detail: 'Descrição do erro' }
    }
*/
  );

  app.get(
    "/ocorrencias/fulltext",
    requireAuth,
    ocorrenciaController.searchOcorrenciasFullText
    /*
    #swagger.tags = ['Ocorrências']
    #swagger.summary = 'Busca full-text em ocorrências'
    #swagger.description = 'Pesquisa por termo livre em título e descrição, com paginação.'

    #swagger.parameters['q'] = {
        in: 'query',
        description: 'Termo de busca (obrigatório)',
        required: true,
        type: 'string',
        example: 'iluminação'
    }
    #swagger.parameters['limit'] = {
        in: 'query',
        description: 'Quantidade por página',
        required: false,
        type: 'integer',
        example: 10
    }
    #swagger.parameters['offset'] = {
        in: 'query',
        description: 'Deslocamento para paginação',
        required: false,
        type: 'integer',
        example: 0
    }

    #swagger.responses[200] = {
        description: 'Resultados da busca',
        schema: [
            {
                ocorrencia_id: 21,
                ocorrencia_protocolo: "2025-000021",
                ocorrencia_titulo: "Iluminação pública apagada",
                ocorrencia_descricao: "Poste sem luz na Av. Central",
                ocorrencia_data: "2025-09-12T19:10:00.000Z",
                status: "Aberta",
                prioridade: "Normal"
            }
        ]
    }
    #swagger.responses[400] = {
        description: 'Parâmetro obrigatório ausente',
        schema: { message: 'Parâmetro q é obrigatório' }
    }
    #swagger.responses[404] = {
        description: 'Nenhum resultado encontrado',
        schema: { message: 'Nenhuma ocorrência encontrada para o termo informado' }
    }
    #swagger.responses[401] = {
        description: 'Não autorizado',
        schema: { message: 'Token de autenticação inválido ou ausente' }
    }
    #swagger.responses[500] = {
        description: 'Erro interno do servidor',
        schema: { message: 'Erro na busca full-text', detail: 'Descrição do erro' }
    }
*/
  );

  app.get(
    "/ocorrencias/by-status",
    requireAuth,
    ocorrenciaController.getOcorrenciasByStatus
    /*
    #swagger.tags = ['Ocorrências']
    #swagger.summary = 'Listar por status'
    #swagger.description = 'Lista ocorrências filtrando pelo ID do status, com paginação.'

    #swagger.parameters['status'] = {
        in: 'query',
        description: 'ID do status',
        required: true,
        type: 'integer',
        example: 1
    }
    #swagger.parameters['limit'] = {
        in: 'query',
        description: 'Quantidade por página',
        required: false,
        type: 'integer',
        example: 10
    }
    #swagger.parameters['offset'] = {
        in: 'query',
        description: 'Deslocamento para paginação',
        required: false,
        type: 'integer',
        example: 0
    }

    #swagger.responses[200] = {
        description: 'Lista filtrada por status',
        schema: [
            {
                ocorrencia_id: 7,
                ocorrencia_protocolo: "2025-000007",
                ocorrencia_titulo: "Calçada danificada",
                ocorrencia_descricao: "Risco de acidentes",
                status: "Aberta",
                prioridade: "Alta",
                ocorrencia_data: "2025-09-08T09:30:00.000Z"
            }
        ]
    }
    #swagger.responses[400] = {
        description: 'Parâmetro inválido',
        schema: { message: 'status inválido' }
    }
    #swagger.responses[404] = {
        description: 'Nenhum registro',
        schema: { message: 'Nenhuma ocorrência encontrada para o status informado' }
    }
    #swagger.responses[401] = {
        description: 'Não autorizado',
        schema: { message: 'Token de autenticação inválido ou ausente' }
    }
    #swagger.responses[500] = {
        description: 'Erro interno do servidor',
        schema: { message: 'Erro ao listar por status', detail: 'Descrição do erro' }
    }
*/
  );

  app.get(
    "/ocorrencias/by-prioridade",
    requireAuth,
    ocorrenciaController.getOcorrenciasByPrioridade
    /*
    #swagger.tags = ['Ocorrências']
    #swagger.summary = 'Listar por prioridade'
    #swagger.description = 'Lista ocorrências filtrando pelo ID da prioridade, com paginação.'

    #swagger.parameters['prioridade'] = {
        in: 'query',
        description: 'ID da prioridade (1 a 4)',
        required: true,
        type: 'integer',
        example: 2
    }
    #swagger.parameters['limit'] = {
        in: 'query',
        description: 'Quantidade por página',
        required: false,
        type: 'integer',
        example: 10
    }
    #swagger.parameters['offset'] = {
        in: 'query',
        description: 'Deslocamento para paginação',
        required: false,
        type: 'integer',
        example: 0
    }

    #swagger.responses[200] = {
        description: 'Lista filtrada por prioridade',
        schema: [
            {
                ocorrencia_id: 33,
                ocorrencia_protocolo: "2025-000033",
                ocorrencia_titulo: "Vazamento de água",
                ocorrencia_descricao: "Vazamento constante na esquina",
                prioridade: "Alta",
                status: "Em Análise",
                ocorrencia_data: "2025-09-14T11:05:00.000Z"
            }
        ]
    }
    #swagger.responses[400] = {
        description: 'Parâmetro inválido',
        schema: { message: 'prioridade inválida' }
    }
    #swagger.responses[404] = {
        description: 'Nenhum registro',
        schema: { message: 'Nenhuma ocorrência encontrada para a prioridade informada' }
    }
    #swagger.responses[401] = {
        description: 'Não autorizado',
        schema: { message: 'Token de autenticação inválido ou ausente' }
    }
    #swagger.responses[500] = {
        description: 'Erro interno do servidor',
        schema: { message: 'Erro ao listar por prioridade', detail: 'Descrição do erro' }
    }
*/
  );

  app.get(
    "/ocorrencias/by-date",
    requireAuth,
    ocorrenciaController.getOcorrenciasByDate
    /*
    #swagger.tags = ['Ocorrências']
    #swagger.summary = 'Listar por período (data inicial/final)'
    #swagger.description = 'Lista ocorrências dentro de um intervalo de tempo, com ordenação e paginação.'

    #swagger.parameters['from'] = {
        in: 'query',
        description: 'Data inicial (ISO 8601)',
        required: false,
        type: 'string',
        example: '2025-09-01T00:00:00.000Z'
    }
    #swagger.parameters['to'] = {
        in: 'query',
        description: 'Data final (ISO 8601)',
        required: false,
        type: 'string',
        example: '2025-09-30T23:59:59.999Z'
    }
    #swagger.parameters['orderDir'] = {
        in: 'query',
        description: 'Ordenação por data (asc|desc)',
        required: false,
        type: 'string',
        example: 'desc'
    }
    #swagger.parameters['limit'] = {
        in: 'query',
        description: 'Quantidade por página',
        required: false,
        type: 'integer',
        example: 10
    }
    #swagger.parameters['offset'] = {
        in: 'query',
        description: 'Deslocamento para paginação',
        required: false,
        type: 'integer',
        example: 0
    }

    #swagger.responses[200] = {
        description: 'Lista dentro do período',
        schema: [
            {
                ocorrencia_id: 18,
                ocorrencia_protocolo: "2025-000018",
                ocorrencia_titulo: "Lixo acumulado",
                ocorrencia_descricao: "Cantos da rua com lixo",
                ocorrencia_data: "2025-09-11T07:45:00.000Z",
                status: "Em Andamento",
                prioridade: "Normal"
            }
        ]
    }
    #swagger.responses[400] = {
        description: 'Parâmetros inválidos',
        schema: { message: 'from inválido' }
    }
    #swagger.responses[404] = {
        description: 'Nenhum registro',
        schema: { message: 'Nenhuma ocorrência encontrada no período informado' }
    }
    #swagger.responses[401] = {
        description: 'Não autorizado',
        schema: { message: 'Token de autenticação inválido ou ausente' }
    }
    #swagger.responses[500] = {
        description: 'Erro interno do servidor',
        schema: { message: 'Erro ao listar por data', detail: 'Descrição do erro' }
    }
*/
  );

  app.get(
    "/ocorrencias/by-local",
    requireAuth,
    ocorrenciaController.getOcorrenciasByLocal
    /*
    #swagger.tags = ['Ocorrências']
    #swagger.summary = 'Listar por local (município/bairro/rua)'
    #swagger.description = 'Lista ocorrências filtrando por município, bairro e/ou rua, com paginação.'

    #swagger.parameters['municipio'] = {
        in: 'query',
        description: 'Nome do município (match parcial, case-insensitive)',
        required: false,
        type: 'string',
        example: 'Saudades'
    }
    #swagger.parameters['bairro'] = {
        in: 'query',
        description: 'Nome do bairro (match parcial)',
        required: false,
        type: 'string',
        example: 'Centro'
    }
    #swagger.parameters['rua'] = {
        in: 'query',
        description: 'Nome da rua (match parcial)',
        required: false,
        type: 'string',
        example: 'Rua das Flores'
    }
    #swagger.parameters['limit'] = {
        in: 'query',
        description: 'Quantidade por página',
        required: false,
        type: 'integer',
        example: 10
    }
    #swagger.parameters['offset'] = {
        in: 'query',
        description: 'Deslocamento para paginação',
        required: false,
        type: 'integer',
        example: 0
    }

    #swagger.responses[200] = {
        description: 'Lista filtrada por local',
        schema: [
            {
                ocorrencia_id: 44,
                ocorrencia_protocolo: "2025-000044",
                ocorrencia_titulo: "Arvore caída",
                ocorrencia_descricao: "Árvore bloqueando calçada",
                ocorrencia_data: "2025-09-15T14:20:00.000Z",
                status: "Aberta",
                prioridade: "Alta",
                municipio_nome: "Saudades",
                local_estado: "SC",
                local_bairro: "Centro",
                local_rua: "Rua das Flores"
            }
        ]
    }
    #swagger.responses[400] = {
        description: 'Parâmetros obrigatórios ausentes',
        schema: { message: 'Informe ao menos um parâmetro: municipio, bairro ou rua' }
    }
    #swagger.responses[404] = {
        description: 'Nenhum registro',
        schema: { message: 'Nenhuma ocorrência encontrada para o local informado' }
    }
    #swagger.responses[401] = {
        description: 'Não autorizado',
        schema: { message: 'Token de autenticação inválido ou ausente' }
    }
    #swagger.responses[500] = {
        description: 'Erro interno do servidor',
        schema: { message: 'Erro ao listar por local', detail: 'Descrição do erro' }
    }
*/
  );

  app.get(
    "/ocorrencias/:id",
    requireAuth,
    ocorrenciaController.getOcorrenciaById
    /*
    #swagger.tags = ['Ocorrências']
    #swagger.summary = 'Buscar ocorrência por ID'
    #swagger.description = 'Retorna os detalhes de uma ocorrência a partir do seu identificador.'

    #swagger.parameters['id'] = {
        in: 'path',
        description: 'ID da ocorrência',
        required: true,
        type: 'integer',
        example: 10
    }

    #swagger.responses[200] = {
        description: 'Ocorrência encontrada',
        schema: {
            ocorrencia_id: 10,
            ocorrencia_titulo: "Buraco na rua",
            ocorrencia_descricao: "Existe um buraco grande na Rua das Flores",
            ocorrencia_data: "2025-09-02T15:25:00.000Z",
            ocorrencia_protocolo: "2025-000010",
            ocorrencia_anonima: false,
            ocorrencia_status_nome: "Aberta",
            user_username: "joao.silva",
            municipio_nome: "Saudades",
            local_estado: "SC",
            local_bairro: "Centro",
            local_rua: "Rua das Flores",
            local_complemento: "Próximo ao mercado"
        }
    }

    #swagger.responses[400] = {
        description: 'Parâmetro inválido',
        schema: { message: 'Parâmetro id inválido' }
    }

    #swagger.responses[404] = {
        description: 'Não encontrada',
        schema: { message: 'Ocorrência não encontrada' }
    }

    #swagger.responses[401] = {
        description: 'Não autorizado',
        schema: { message: 'Token de autenticação inválido ou ausente' }
    }

    #swagger.responses[500] = {
        description: 'Erro interno do servidor',
        schema: { message: 'Erro ao buscar ocorrência', detail: 'Descrição do erro' }
    }
*/
  );

  app.get(
    "/ocorrencias/user/:user_id",
    requireAuth,
    ocorrenciaController.getOcorrenciaByUser
    /*
    #swagger.tags = ['Ocorrências']
    #swagger.summary = 'Listar ocorrências de um usuário'
    #swagger.description = 'Retorna todas as ocorrências registradas por um usuário específico, filtrando pelo seu ID.'

    #swagger.parameters['user_id'] = {
        in: 'path',
        description: 'ID do usuário',
        required: true,
        type: 'integer',
        example: 5
    }

    #swagger.responses[200] = {
        description: 'Lista de ocorrências do usuário',
        schema: [
            {
                ocorrencia_id: 12,
                ocorrencia_titulo: "Iluminação pública queimada",
                ocorrencia_data: "2025-09-10T18:40:00.000Z",
                ocorrencia_protocolo: "2025-000012",
                ocorrencia_anonima: false,
                ocorrencia_status_nome: "Em Análise"
            }
        ]
    }

    #swagger.responses[400] = {
        description: 'Parâmetro inválido',
        schema: { message: 'Parâmetro user_id inválido' }
    }

    #swagger.responses[404] = {
        description: 'Nenhuma ocorrência encontrada para este usuário',
        schema: { message: 'Nenhuma ocorrência encontrada para este usuário' }
    }

    #swagger.responses[401] = {
        description: 'Não autorizado',
        schema: { message: 'Token de autenticação inválido ou ausente' }
    }

    #swagger.responses[500] = {
        description: 'Erro interno do servidor',
        schema: { message: 'Erro ao buscar ocorrências do usuário', detail: 'Descrição do erro' }
    }
*/
  );

  app.get(
    "/ocorrencias/:ocorrencia_atribuida",
    requireAuth,
    ocorrenciaController.getOcorrenciaByUser
    /*
    #swagger.tags = ['Ocorrências']
    #swagger.summary = 'Listar ocorrências de um Setor'
    #swagger.description = 'Retorna todas as ocorrências registradas para um Setor específico, filtrando pelo seu Setor.'

    #swagger.parameters['ocorrencia_atribuida'] = {
        in: 'path',
        description: 'ID do Setor',
        required: true,
        type: 'integer',
        example: 5
    }

    #swagger.responses[200] = {
        description: 'Lista de ocorrências do Setor',
        schema: [
            {
                ocorrencia_id: 12,
                ocorrencia_titulo: "Iluminação pública queimada",
                ocorrencia_data: "2025-09-10T18:40:00.000Z",
                ocorrencia_protocolo: "2025-000012",
                ocorrencia_anonima: false,
                ocorrencia_status_nome: "Em Análise"
            }
        ]
    }

    #swagger.responses[400] = {
        description: 'Parâmetro inválido',
        schema: { message: 'Parâmetro user_id inválido' }
    }

    #swagger.responses[404] = {
        description: 'Nenhuma ocorrência encontrada para este Setor',
        schema: { message: 'Nenhuma ocorrência encontrada para este Setor' }
    }

    #swagger.responses[401] = {
        description: 'Não autorizado',
        schema: { message: 'Token de autenticação inválido ou ausente' }
    }

    #swagger.responses[500] = {
        description: 'Erro interno do servidor',
        schema: { message: 'Erro ao buscar ocorrências do usuário', detail: 'Descrição do erro' }
    }
*/
  );

  app.put(
    "/ocorrencias/:id",
    requireAuth,
    ocorrenciaController.updateOcorrencia
    /*
    #swagger.tags = ['Ocorrências']
    #swagger.summary = 'Atualizar ocorrência'
    #swagger.description = 'Atualiza campos permitidos de uma ocorrência pelo ID.'

    #swagger.parameters['id'] = {
        in: 'path',
        description: 'ID da ocorrência',
        required: true,
        type: 'integer',
        example: 10
    }

    #swagger.parameters['body'] = {
        in: 'body',
        description: 'Campos permitidos para atualização',
        required: true,
        schema: {
            ocorrencia_titulo: "Título atualizado",
            ocorrencia_descricao: "Descrição detalhada",
            ocorrencia_prioridade: 2,
            ocorrencia_status: 3,
            ocorrencia_anonima: false
        }
    }

    #swagger.responses[200] = {
        description: 'Ocorrência atualizada com sucesso',
        schema: {
            message: 'Ocorrência atualizada com sucesso',
            ocorrencia: {
                ocorrencia_id: 10,
                ocorrencia_status: 3
            }
        }
    }

    #swagger.responses[400] = {
        description: 'Parâmetros inválidos',
        schema: { message: 'Parâmetro id inválido' }
    }

    #swagger.responses[422] = {
        description: 'Falha de validação',
        schema: { message: 'ocorrencia_status inválido' }
    }

    #swagger.responses[404] = {
        description: 'Não encontrada',
        schema: { message: 'Ocorrência não encontrada' }
    }

    #swagger.responses[401] = {
        description: 'Não autorizado',
        schema: { message: 'Token de autenticação inválido ou ausente' }
    }

    #swagger.responses[500] = {
        description: 'Erro interno do servidor',
        schema: { message: 'Erro ao atualizar ocorrência', detail: 'Descrição do erro' }
    }
*/
  );

  app.delete(
    "/ocorrencias/:id",
    requireAuth,
    ocorrenciaController.deleteOcorrencia
    /*
    #swagger.tags = ['Ocorrências']
    #swagger.summary = 'Excluir ocorrência'
    #swagger.description = 'Marca uma ocorrência como excluída (soft delete) pelo ID informado.'

    #swagger.parameters['id'] = {
        in: 'path',
        description: 'ID da ocorrência',
        required: true,
        type: 'integer',
        example: 15
    }

    #swagger.responses[200] = {
        description: 'Ocorrência excluída com sucesso',
        schema: { message: 'Ocorrência excluída com sucesso' }
    }

    #swagger.responses[400] = {
        description: 'Parâmetro inválido',
        schema: { message: 'Parâmetro id inválido' }
    }

    #swagger.responses[404] = {
        description: 'Não encontrada',
        schema: { message: 'Ocorrência não encontrada' }
    }

    #swagger.responses[401] = {
        description: 'Não autorizado',
        schema: { message: 'Token de autenticação inválido ou ausente' }
    }

    #swagger.responses[500] = {
        description: 'Erro interno do servidor',
        schema: { message: 'Erro ao excluir ocorrência', detail: 'Descrição do erro' }
    }
*/
  );
};