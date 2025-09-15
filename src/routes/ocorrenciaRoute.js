const ocorrenciaController = require('../controllers/ocorrenciaController');
const requireAuth = require('../auth/requireAuth');

module.exports = (app) => {
    app.post('/ocorrencias', requireAuth, ocorrenciaController.createOcorrencia
    /*
        #swagger.tags = ['Ocorrências']
        #swagger.summary = 'Criar uma nova ocorrência'
        #swagger.description = 'Endpoint para registrar uma ocorrência vinculada a um local e a um usuário.'

        #swagger.parameters['body'] = {
            in: 'body',
            description: 'Dados da ocorrência',
            required: true,
            schema: {
                "ocorrencia_user_id": 1,
                "ocorrencia_anonima": false,
                "ocorrencia_titulo": "Buraco na rua",
                "ocorrencia_descricao": "Existe um buraco grande na Rua das Flores",
                "ocorrencia_prioridade": 2,
                    "local": {
                    "local_municipio_id": 4569,
                    "local_estado": "SC",
                    "local_bairro": "Centro",
                    "local_rua": "Rua das Flores",
                    "local_complemento": "Próximo ao mercado",
                    "local_latitude": -27.1362,
                    "local_longitude": -53.0022
                    }
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

        #swagger.responses[400] = {
            description: 'Erro de validação ou dados inválidos'
        }

        #swagger.responses[401] = {
            description: 'Não autorizado',
            schema: { mensagem: 'Token de autenticação inválido ou ausente' }
        }
    */);
    
    app.get('/ocorrencias/search', requireAuth, ocorrenciaController.searchOcorrenciaByFieldValue
    /*
        #swagger.tags = ['Ocorrências']
        #swagger.summary = 'Busca dinâmica de ocorrências'
        #swagger.description = `
            Permite buscar ocorrências de forma dinâmica, filtrando por status, prioridade, título ou descrição.<br>
            <b>Parâmetros de consulta (query):</b>
            <ul>
                <li><b>field</b> (opcional): Campo para filtrar. Valores possíveis: <code>status</code>, <code>prioridade</code>, <code>titulo</code>, <code>descricao</code>. Padrão: <code>titulo</code>.</li>
                <li><b>value</b> (opcional): Valor a ser pesquisado. Para <code>status</code> e <code>prioridade</code>, informe o <b>ID</b> correspondente. Para <code>titulo</code> e <code>descricao</code>, informe um texto.</li>
                <li><b>orderField</b> (opcional): Campo para ordenação. Valores possíveis: <code>data</code>, <code>status</code>, <code>prioridade</code>, <code>titulo</code>. Padrão: <code>data</code>.</li>
                <li><b>orderDir</b> (opcional): Direção da ordenação. Valores possíveis: <code>asc</code> ou <code>desc</code>. Padrão: <code>desc</code>.</li>
                <li><b>limit</b> (opcional): Número máximo de resultados por página. Padrão: <code>10</code>.</li>
                <li><b>offset</b> (opcional): Quantidade de registros a pular (para paginação). Padrão: <code>0</code>.</li>
            </ul>
            <b>Exemplos de uso:</b>
            <ul>
                <li><code>/ocorrencias/search?field=status&value=1</code> (busca por status ID 1)</li>
                <li><code>/ocorrencias/search?field=prioridade&value=2</code> (busca por prioridade ID 2)</li>
                <li><code>/ocorrencias/search?field=titulo&value=buraco</code> (busca por título contendo "buraco")</li>
                <li><code>/ocorrencias/search?orderField=prioridade&orderDir=asc&limit=5</code> (ordena por prioridade, ascendente, 5 por página)</li>
            </ul>
            <b>Status HTTP:</b>
            <ul>
                <li><b>200</b>: Sucesso, retorna lista de ocorrências.</li>
                <li><b>400</b>: Parâmetro inválido.</li>
                <li><b>404</b>: Nenhuma ocorrência encontrada.</li>
                <li><b>401</b>: Não autorizado.</li>
                <li><b>500</b>: Erro interno do servidor.</li>
            </ul>
        `
    
        #swagger.parameters['field'] = {
            in: 'query',
            description: 'Campo para filtrar (status, prioridade, titulo, descricao)',
            required: false,
            type: 'string',
            example: 'status'
        }
        #swagger.parameters['value'] = {
            in: 'query',
            description: 'Valor do filtro (ID para status/prioridade, texto para titulo/descricao)',
            required: false,
            type: 'string',
            example: '1'
        }
        #swagger.parameters['orderField'] = {
            in: 'query',
            description: 'Campo para ordenação (data, status, prioridade, titulo)',
            required: false,
            type: 'string',
            example: 'data'
        }
        #swagger.parameters['orderDir'] = {
            in: 'query',
            description: 'Direção da ordenação (asc ou desc)',
            required: false,
            type: 'string',
            example: 'desc'
        }
        #swagger.parameters['limit'] = {
            in: 'query',
            description: 'Limite de resultados por página',
            required: false,
            type: 'integer',
            example: 10
        }
        #swagger.parameters['offset'] = {
            in: 'query',
            description: 'Quantidade de registros a pular',
            required: false,
            type: 'integer',
            example: 0
        }
    
        #swagger.responses[200] = {
            description: 'Lista de ocorrências encontradas',
            schema: [
                {
                    ocorrencia_id: 10,
                    ocorrencia_protocolo: "2025-000010",
                    ocorrencia_titulo: "Buraco na rua",
                    ocorrencia_descricao: "Existe um buraco grande na Rua das Flores",
                    status: "Aberta",
                    prioridade: "Alta",
                    ocorrencia_data: "2025-09-02T15:25:00.000Z"
                }
            ]
        }
    
        #swagger.responses[400] = {
            description: 'Parâmetro inválido',
            schema: { message: 'Campo de filtro inválido' }
        }
    
        #swagger.responses[404] = {
            description: 'Nenhuma ocorrência encontrada',
            schema: { message: 'Nenhuma ocorrência encontrada.' }
        }
    
        #swagger.responses[401] = {
            description: 'Não autorizado',
            schema: { message: 'Token de autenticação inválido ou ausente' }
        }
    
        #swagger.responses[500] = {
            description: 'Erro interno do servidor',
            schema: { message: 'Erro ao Buscar ocorrencias', detail: 'Descrição do erro.' }
        }
    */);

    app.get('/ocorrencias/:id', requireAuth, ocorrenciaController.getOcorrenciaById
    /*
        #swagger.tags = ['Ocorrências']
        #swagger.summary = 'Buscar uma ocorrência'
        #swagger.description = 'Retorna os detalhes de uma ocorrência pelo seu ID.'

        #swagger.parameters['id'] = {
            in: 'path',
            description: 'ID da ocorrência',
            required: true
        }

        #swagger.responses[200] = {
            description: 'Dados da ocorrência',
            schema: {
                ocorrencia_id: 10,
                ocorrencia_titulo: "Buraco na rua",
                ocorrencia_descricao: "Existe um buraco grande na Rua das Flores",
                ocorrencia_data: "2025-09-02T15:25:00.000Z",
                ocorrencia_status_nome: "Aberta",
                user_username: "joao.silva"
            }
        }

        #swagger.responses[404] = {
            description: 'Ocorrência não encontrada'
        }

        #swagger.responses[401] = {
            description: 'Não autorizado',
            schema: { mensagem: 'Token de autenticação inválido ou ausente' }
        }
    */);

    app.get('/ocorrencias/user/:user_id', requireAuth, ocorrenciaController.getOcorrenciaByUser
    /*
        #swagger.tags = ['Ocorrências']
        #swagger.summary = 'Buscar ocorrências por usuário'
        #swagger.description = 'Retorna todas as ocorrências feitas por um usuário específico.'
        #swagger.parameters['user_id'] = {
            in: 'path',
            description: 'ID do usuário',
            required: true
        }
        #swagger.responses[200] = {
            description: 'Lista de ocorrências do usuário',
            schema: [
                {
                    ocorrencia_id: 10,
                    ocorrencia_titulo: "Buraco na rua",
                    ocorrencia_data: "2025-09-02T15:25:00.000Z",
                    ocorrencia_status: 1
                }
            ]
        }
    */);
app.put('/ocorrencias/:id', requireAuth, ocorrenciaController.updateOcorrencia
/*
    #swagger.tags = ['Ocorrências']
    #swagger.summary = 'Atualiza campos permitidos de uma ocorrência'
    #swagger.description = `
        Atualiza apenas os campos permitidos de uma ocorrência existente pelo seu ID.<br>
        <b>Campos permitidos para atualização:</b>
        <ul>
            <li>ocorrencia_titulo</li>
            <li>ocorrencia_descricao</li>
            <li>ocorrencia_prioridade</li>
            <li>ocorrencia_status</li>
        </ul>
        <b>Observações:</b>
        <ul>
            <li>Se nenhum campo permitido for enviado, retorna erro 400.</li>
            <li>Se a ocorrência não existir, retorna erro 404.</li>
            <li>É necessário estar autenticado para atualizar uma ocorrência.</li>
        </ul>
    `

    #swagger.parameters['id'] = {
        in: 'path',
        description: 'ID da ocorrência a ser atualizada',
        required: true
    }

    #swagger.parameters['body'] = {
        in: 'body',
        description: 'Informe ao menos um dos campos permitidos para atualização',
        required: true,
        schema: {
            ocorrencia_titulo: "Título atualizado",
            ocorrencia_descricao: "Descrição detalhada da ocorrência",
            ocorrencia_prioridade: 2,
            ocorrencia_status: 1
        }
    }

    #swagger.responses[200] = {
        description: 'Ocorrência atualizada com sucesso',
        schema: {
            ocorrencia_id: 10,
            ocorrencia_titulo: "Título atualizado",
            ocorrencia_descricao: "Descrição detalhada da ocorrência",
            ocorrencia_prioridade: 2,
            ocorrencia_status: 1
        }
    }

    #swagger.responses[400] = {
        description: 'Nenhum campo permitido para atualização informado',
        schema: { message: 'Nenhum campo permitido para atualização informado.' }
    }

    #swagger.responses[404] = {
        description: 'Ocorrência não encontrada ou nenhum campo atualizado',
        schema: { message: 'Ocorrência não encontrada ou nenhum campo atualizado.' }
    }

    #swagger.responses[401] = {
        description: 'Não autorizado. Token de autenticação inválido ou ausente.',
        schema: { message: 'Não Autenticado' }
    }

    #swagger.responses[500] = {
        description: 'Erro interno do servidor',
        schema: { message: 'Descrição do erro.' }
    }
*/);
    app.delete('/ocorrencias/:id', requireAuth, ocorrenciaController.deleteOcorrencia
    /*
        #swagger.tags = ['Ocorrências']
        #swagger.summary = 'Deletar uma ocorrência'
        #swagger.description = 'Marca uma ocorrência como excluída pelo seu ID.'
        #swagger.parameters['id'] = {
            in: 'path',
            description: 'ID da ocorrência',
            required: true
        }
        #swagger.responses[204] = {
            description: 'Ocorrência deletada com sucesso'
        }
        #swagger.responses[401] = {
            description: 'Não autorizado',
            schema: { mensagem: 'Token de autenticação inválido ou ausente' }
        }
    */);
};