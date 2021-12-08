//Clase Modelo para el esquema de biblioteca que tendra la base de datos

const mongoose = require('mongoose');
const Schema = mongoose.Schema;


var biblio = new  Schema({
    //Propiedades que tendra este esquema
    nombre: {type: String, text: true},
    categoria : String,
    anio: String,
    url: String,
    img: String
  });
  
  biblio.index({nombre: 'text'});


  module.exports = mongoose.model('Biblioteca', biblio);