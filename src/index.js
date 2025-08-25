const express = require('express');
const cors = require("cors");

const app = express();
const cookieParser = require('cookie-parser');
const port = 3000;

app.use(express.json());

require('./services/swagger');
require('./routes')(app);

app.use('/v1/docs', express.static('./src/views'));
app.use('/docs/swagger.yaml', express.static('./src/docs/swagger.yaml'));
app.use(cookieParser());

app.use(cors({ origin: "*"}));

app.listen(port), () => {
    console.log(`Server running on port ${port}`)};

app.get('/', (req, res) => {
    res.cookie('myCookie', 'Testing Cookie');
    res.send('API is running');
});