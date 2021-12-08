const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const biblioteca = require('./app/routes/biblioteca');
const guias = require('./app/routes/guia');
const laboratorios = require('./app/routes/laboratorio');
const mongoConfig = require('./app/environments/mongoConfig');

const app = express();

app.use(express.urlencoded({
    limit: '500mb', 
    extended: true
  }));
app.use(express.json({limit: '500mb'}));
app.use(cors());

// Configurar cabeceras y cors
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
  next();
});

//Credenciales para conectarse a la base de datos en Mongodb Atlas
//la variable urlMongoDB contiene la url para conectarse con la base de datos
mongoose.connect(mongoConfig.urlMongoDB, {useNewUrlParser: true, useUnifiedTopology: true});

//las diferentes rutas que se tendran a disposicion 
app.use('/api/biblioteca', biblioteca);
app.use('/api/guias', guias);
app.use('/api/laboratorios', laboratorios);

//La aplicacion se ejecuta en el puerto 4000
app.listen(4000, () => {
  console.log(`App listening at http://localhost:4000`)
})

module.exports = app;
