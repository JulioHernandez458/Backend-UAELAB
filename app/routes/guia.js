//Clase con los diferentes metodos a realizar para la ruta */api/guias/

const express = require('express');
const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');
const multer = require('multer');
const mimeTypes = require('mime-types');
const path = require("path");
const os = require('os');
const bodyParser = require('body-parser');
const async = require('async');

const guias = require('../models/guia');
const router = express.Router();


//metodo al entrar en la direccion */api/guias
//Hara una busqueda en la base de datos apoyandose de la clase modelo Guia
//y devolvera el resultado de esta busqueda sin ningun filtro (O sea a todos los datos de guias)
router.get('/', (req, res) => {
    guias.find()
        .exec()
        .then(x => res.status(200).send(x));
});


//Metodo  al entrar en la direccion */api/guias/id/"id"
//Se hara una busqueda en el esquema guia del id que coincida
//con la propiedad _id del esquema y se devolvera el resultado
router.get('/id/:id', (req, res) => {
    guias.findById(req.params.id)
        .exec()
        .then(x => res.status(200).send(x))
});


//Metodo  al entrar en la direccion */api/guias/search/id/"id"
//Se hara una busqueda en el esquema guias del id del laboratorio que coincida
//con la propiedad laboratorio_id del esquema y se devolvera el resultado
router.get('/search/id/:laboratorio_id', (req, res) => {
    //`${req.params.asignatura}`
    guias.find({ "laboratorio_id": req.params.laboratorio_id })
        .exec()
        .then(x => res.status(200).send(x))
});


//Metodo  al entrar en la direccion */api/guias/"nombre"/laboratorio/"laboratorio"
//Se hara una busqueda en el esquema guias donde tengan el mismo laboratorio_id 
//y coincida el nombre de la guia con los campos introducidos
router.get('/:nombre/laboratorio/:lab', (req, res) => {

    guias.find({ $and: [{ "laboratorio_id": req.params.lab }, { $text: { $search: req.params.nombre } }] })
        .exec()
        .then(x => res.status(200).send(x))
});


const tmp = os.tmpdir();


// Nos apoyamos de multer para administrar el documento pdf que recibieremos en el POST
// se indica como se llamara este archivo y se guarda temporalmente en el servidor en la carpeta tmp
var storage = multer.diskStorage({
    filename: function (req, file, cb) {
        cb("", file.originalname + '-' + Date.now() + '.' + mimeTypes.extension(file.mimetype))
    }
})

var upload = multer({ storage: storage })



//Metodo POST al entrar en la direccion */api/guias/files/add
//Se recibe un documento pdf y se configura con los parametros establecidos con multer anteriormente
//y podremos acceder a sus propiedades dentro del metodo atravez de req.file
router.post('/files/add', upload.single('file'), (req, res) => {


    /*
  *
  * Ya temiendo manipulacion del documento haremos uso de la API de GOOGLE DRIVE para
  * guardar este archivo en la nuve y acceder a el cuando querramos y sin que nos este generando
  * espacio en nuestro servidor.
  * 
  * Para m??s informaci??n buscar la documentaci??n de Google drive api
  *  
  */

    // If modifying these scopes, delete token.json.
    const SCOPES = [
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/drive.appdata',
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/drive.metadata',
        'https://www.googleapis.com/auth/drive.metadata.readonly',
        'https://www.googleapis.com/auth/drive.photos.readonly',
        'https://www.googleapis.com/auth/drive.readonly'];
    // The file token.json stores the user's access and refresh tokens, and is
    // created automatically when the authorization flow completes for the first
    // time.

    /**
    * Create an OAuth2 client with the given credentials, and then execute the
    * given callback function.
    * @param {Object} credentials The authorization client credentials.
    * @param {function} callback The callback to call with the authorized client.
    */

    //Se debe descargar el archivos credentials.json dado en la consola de desarrollador de google
    //con nuestras credenciales de la aplicaci??n y tenemos que crear un archivo token.json
    //para guardar el token de acceso generado por google para poder uso de la api de drive
    //este token de acceso se nos generar?? al correr por primera vez la app

    const TOKEN_PATH = './app/environments/token.json';
    const content = require('../environments/credentials.json');

    authorize(content, listFiles);

    function authorize(credentials, callback) {
        var client_secret = content.web.client_secret;
        var client_id = content.web.client_id;
        var redirect_uris = content.web.redirect_uris[0];


        const oAuth2Client = new google.auth.OAuth2(
            client_id, client_secret, redirect_uris);

        // Check if we have previously stored a token.
        fs.readFile(TOKEN_PATH, (err, token) => {
            if (err) return getAccessToken(oAuth2Client, callback);
            oAuth2Client.setCredentials(JSON.parse(token));
            callback(oAuth2Client);
        });
    }

    /**
    * Get and store new token after prompting for user authorization, and then
    * execute the given callback with the authorized OAuth2 client.
    * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
    * @param {getEventsCallback} callback The callback for the authorized client.
    */
    function getAccessToken(oAuth2Client, callback) {
        const authUrl = oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES,
        });
        console.log('Authorize this app by visiting this url:', authUrl);
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        rl.question('Enter the code from that page here: ', (code) => {
            rl.close();
            oAuth2Client.getToken(code, (err, token) => {
                if (err) return console.error('Error retrieving access token', err);
                oAuth2Client.setCredentials(token);
                // Store the token to disk for later program executions
                fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                    if (err) return console.error(err);
                    console.log('Token stored to', TOKEN_PATH);
                });
                callback(oAuth2Client);
            });
        });
    }

    /**
    * Lists the names and IDs of up to 10 files.
    * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
    */
    function listFiles(auth) {
        const drive = google.drive({ version: 'v3', auth });

        //Agregando propiedades del archivo para enviarlo a drive

        var fileMetadata = {
            'name': req.file.filename
        };
        var media = {
            mimeType: 'application/pdf',
            body: fs.createReadStream(req.file.path)
        };
        drive.files.create({
            resource: fileMetadata,
            media: media,
            //fields: '*'
            fields: 'id, webViewLink'
        }, function (err, file) {
            if (err) {
                // Handle error
                console.error(err);
            } else {
                console.log(file.data)





                var fileId = file.data.id;
                var permissions = [
                    {
                        'type': 'domain',
                        'role': 'reader',
                        'domain': 'uae.edu.sv'
                    }
                ];
                // Using the NPM module 'async'
                async.eachSeries(permissions, function (permission, permissionCallback) {
                    drive.permissions.create({
                        resource: permission,
                        fileId: fileId,
                        fields: 'id',
                    }, function (err, r1) {
                        if (err) {
                            // Handle error...
                            console.error(err);
                            permissionCallback(err);
                        } else {
                            res.status(200).send(file.data);
                            //Se manda a eliminar el docuemnto en el servidor para no generar espacio
                            fs.unlink(req.file.path, (err) => {
                                if (err) throw err;
                            });

                            permissionCallback();
                        }
                    });
                }, function (err) {
                    if (err) {
                        // Handle error
                        console.error(err);
                    } else {
                        // All permissions inserted
                    }
                });
            }
        })
    }



});



//Metodo POST al entrar en la direccion */api/guias
//Metodo para agregar un nuevo registro del esquema guia
router.post('/', (req, res) => {
    guias.create(req.body).then(x => res.status(201).send(x))
});


//Metodo PUT al entrar en la direccion */api/guias/"id"
//Metodo para modificar un registro del esquema guia con su "id" 
//y el nuevo contenido a actualizar
router.put('/:id', (req, res) => {
    guias.findByIdAndUpdate(req.params.id, req.body)
        .then(x => res.status(204).send(x))
});


//Metodo DELETE al entrar en la direccion */api/guias/"id"
//Metodo para eliminar un registro del esquema guia por su "id"
router.delete('/:id', (req, res) => {
    guias.findByIdAndDelete(req.params.id).exec().then(x => res.status(204).send(x))
});

module.exports = router;