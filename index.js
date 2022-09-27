require('dotenv').config();

const port = 3000;
const express = require('express');
const server = express();

const morgan = require('morgan');
server.use(morgan('dev'));

server.use(express.json())

const apiRouter = require('./api');
server.use('/api', apiRouter);

server.use((req, res, next) => {
  console.log('<____Body Logger Start____>');
  console.log(req.body);
  console.log('<____Body Logger End____>');

  next();
});

server.get('/add/:first/to/:second', (req, res, next) => {
  res.send(`<h1>${ req.params.first } + ${ req.params.second } = ${
    Number(req.params.first) + Number(req.params.second)
   }</h1>`);
});

const { client } = require('./db');
client.connect();

server.listen(port, () => {
  console.log('server is up on port', port)
});