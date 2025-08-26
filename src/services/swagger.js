const swaggerAutogen = require('swagger-autogen')('pt-BR');

const doc = {
    info: {
        version: '1.0.0',
        title: 'Reclamask API',
        description: 'API documentation for Reclamask project'
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
    './src/routes/reclamacaoRoute.js'
];

swaggerAutogen(outputFile, endpointsFiles, doc);