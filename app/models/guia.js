//Clase Modelo para el esquema de guias que tendra la base de datos

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const guia = mongoose.model('Guia', new Schema({
    //Propiedades que tendra este esquema

    //la propiedad laboratorio_id estará enlazada con el id del esquema laboratorio
    laboratorio_id: { type: Schema.Types.ObjectId, ref: 'Laboratorio'},
    nombre: {type: String, text: true},
    url: String,
    img: String
}));

module.exports = guia;