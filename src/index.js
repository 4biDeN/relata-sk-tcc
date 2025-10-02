const express = require('express');
const cors = require("cors");

const app = express();
const cookieParser = require('cookie-parser');
const port = 3000;

app.use(express.json());


app.use(cors({
  origin: [/^http:\/\/localhost:\d+$/, /^http:\/\/127\.0\.0\.1:\d+$/],
  credentials: true
}))

app.use(cookieParser());

require('./services/swagger');
require('./routes')(app);


app.use('/v1/docs', express.static('./src/views'));
app.use('/docs/swagger.yaml', express.static('./src/docs/swagger.yaml'));

app.listen(port), () => {
    console.log(`Server running on port ${port}`)};