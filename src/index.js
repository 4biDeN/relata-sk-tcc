const express = require('express');

const app = express();
const port = 3000;

app.use(express.json());

require('./services/swagger');
require('./routes')(app);

app.use('/v1/docs', express.static('./src/views'));
app.use('/docs/swagger.yaml', express.static('./src/docs/swagger.yaml'));

app.listen(port);