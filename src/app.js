const express = require('express');
const bodyParser = require('body-parser');
const {sequelize} = require('./model')
const app = new express();
const globalErrorHandler = require('./controllers/errorController');

//routers
const adminRouter = require('./routes/adminRoutes');

app.use(bodyParser.json());
app.set('sequelize', sequelize)
app.set('models', sequelize.models)

app.use('/admin', adminRouter);

app.use(globalErrorHandler);

module.exports = app;