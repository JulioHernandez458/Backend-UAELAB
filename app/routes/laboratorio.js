//Clase con los diferentes metodos a realizar para la ruta */api/laboratorios/

const express = require('express');
const labs = require('../models/laboratorio');
const router = express.Router();


//metodo al entrar en la direccion */api/guias
//Hara una busqueda en la base de datos apoyandose de la clase modelo Laboratorio
//y devolvera el resultado de esta busqueda sin ningun filtro (O sea a todos los datos de laborartorios)
router.get('/', (req, res) => {
    labs.find()
        .exec()
        .then(x => res.status(200).send(x));
});


//Metodo  al entrar en la direccion */api/laboratorios/search/id/"id"
//Se hara una busqueda en el esquema laboratorio del id que coincida
//con la propiedad _id del esquema y se devolvera el resultado
router.get('/search/id/:id', (req, res) => {
    labs.findById(req.params.id)
        .exec()
        .then(x => res.status(200).send(x))
});


//Metodo  al entrar en la direccion */api/laboratorios/"nombre"
//Se hara una busqueda en el esquema laboratorio del "nombre" que coincida
//con la propiedad nombre del esquema y se devolvera el resultado
router.get('/:nombre', (req, res) => {
    labs.find({ $text: { $search: req.params.nombre } })
        .exec()
        .then(x => res.status(200).send(x));
});


//Metodo POST al entrar en la direccion */api/laboratorios
//Metodo para agregar un nuevo registro del esquema laboratorio
router.post('/', (req, res) => {
    labs.create(req.body).then(x => res.status(201).send(x))
});


//Metodo PUT al entrar en la direccion */api/laboratorios/"id"
//Metodo para modificar un registro del esquema laboratorio con su "id" 
//y el nuevo contenido a actualizar
router.put('/:id', (req, res) => {
    labs.findByIdAndUpdate(req.params.id, req.body)
        .then(x => res.status(204).send(x));
});


//Metodo DELETE al entrar en la direccion */api/laboratorios/"id"
//Metodo para eliminar un registro del esquema laboratorio por su "id"
router.delete('/:id', (req, res) => {
    labs.findByIdAndDelete(req.params.id).exec().then(x => res.status(204).send(x))
});

module.exports = router;