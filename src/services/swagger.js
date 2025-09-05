const swaggerAutogen = require('swagger-autogen')('pt-BR');

const doc = {
    info: {
        version: '1.0.1',
        title: 'Relata Saudades API',
        description: 'API para o aplicativo Relata Saudades, que permite aos usuários registrar e gerenciar ocorrências em sua cidade.'
    },
    host: 'localhost:3000',
    basePath: '',
    schemes: ['http'],
    consumes: ['application/json'],
    produces: ['application/json'],
}

const outputFile = './src/docs/swagger.yaml';
const endpointsFiles = [ 
    './src/routes/login.js',
    './src/routes/userRoute.js',
    './src/routes/ocorrenciaRoute.js'
];

swaggerAutogen(outputFile, endpointsFiles, doc);