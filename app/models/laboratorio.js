//Clase Modelo para el esquema de laboratorio que tendra la base de datos

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const labos = mongoose.model('Laboratorio', new Schema({
    //Propiedades que tendra este esquema
    nombre: {type: String, text: true},
    asignatura: String,
    img: String
}))

module.exports = labos;