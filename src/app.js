const express = require('express');
const bodyParser = require('body-parser');
const app = new express();
const globalErrorHandler = require('./controllers/errorController');

app.use(bodyParser.json());

app.use(globalErrorHandler);

module.exports = app;