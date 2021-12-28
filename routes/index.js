var API_KEY = "1234";
var SECRET_KEY = "INFINITOSOFTWARE_IquitosDelivery_Key_jsdksdkriewr";

var express = require('express')
var router = express.Router();

const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }

});

const upload = multer({ storage: storage });
const cloudinary = require('cloudinary').v2


var jwt = require('jsonwebtoken');
var exjwt = require('express-jwt');
const { poolPromise, sql } = require('../db')

/*
 * DECLARAR CLAVE SECRETA
 * */
const jwtMW = exjwt({
    secret: SECRET_KEY
});

//+++++//TEST API//+++++/// - INFINITO SOFTWARE
router.get('/', function (req, res) {
    res.end("API CORRIENDO");
});

//+++++//TEST API CON JWT//+++++/// - INFINITO SOFTWARE
router.get('/testjwt', jwtMW, function (req, res) {
    var authorization = req.headers.authorization, decoded;
    try {
        decoded = jwt.verify(authorization.split(' ')[1], SECRET_KEY);
    }
    catch (e) {
        return res.status(401).send('Unauthorized');
    }

    var fbid = decoded.fbid;
    res.send(JSON.stringify({ success: true, message: "FBID: " + fbid }));
});

//=========================================================================
// REQUEST JWT WITH FIREBASE ID
//=========================================================================

router.get('/getKey', async (req, res, next) => {
    var fbid = req.query.fbid;
    if (fbid != null) {
        let token = jwt.sign({ fbid: fbid }, SECRET_KEY, {});
        res.send(JSON.stringify({ success: true, token: token }));
    }
    else {
        res.send(JSON.stringify({ success: false, message: "Missing fbid in request" }));
    }
});

//=========================================================================
// TABLA EMPRESA
// POST / GET
//=========================================================================

router.get('/Pa_MB_Empresa', jwtMW, async (req, res, next) => {

    var Texto = req.query.Texto;
    var Opcion = req.query.Opcion;

    if (Opcion != null) {
        try {
            const pool = await poolPromise
            const queryResult = await pool.request()
                .input('Texto', sql.VarChar, Texto)
                .input('Opcion', sql.Int, 1)
                .execute('Pa_MB_Empresa')

            if (queryResult.recordset.length > 0) {
                res.send(JSON.stringify({ success: true, result: queryResult.recordset }));
            }
            else {
                res.send(JSON.stringify({ success: false, message: "Empty" }));
            }
        }
        catch (err) {
            res.status(500) //Internal Server Error
            res.send(JSON.stringify({ success: false, message: err.message }));
        }
    }
    else {
        res.send(JSON.stringify({ success: false, message: "Missing codigo in query" }));
    }

});

router.get('/token', jwtMW, async (req, res, next) => {

    var fbid = req.query.fbid;
    if (fbid != null) {
        try {
            const pool = await poolPromise
            const queryResult = await pool.request()
                .input('Opcion', sql.Int, 1)
                .input('FBID', sql.NVarChar, fbid)
                .input('TOKEN', sql.NVarChar, 0) //NO SE USA PERO EL PROCEDIMIENTO LO ESPERA
                .execute('PA_POST_GET_Token')
            //.query('SELECT FBID, Token FROM Token where FBID = FBID')

            if (queryResult.recordset.length > 0) {
                res.send(JSON.stringify({ success: true, result: queryResult.recordset }));
            }
            else {
                res.send(JSON.stringify({ success: false, message: "Empty" }));
            }
        }
        catch (err) {
            res.status(500) //Internal Server Error
            res.send(JSON.stringify({ success: false, message: err.message }));
        }
    }
    else {
        res.send(JSON.stringify({ success: false, message: "Missing fbid in JWT" }));
    }

});

router.post('/token', jwtMW, async (req, res, next) => {

    var authorization = req.headers.authorization, decoded;
    try {
        decoded = jwt.verify(authorization.split(' ')[1], SECRET_KEY);
    }
    catch (e) {
        return res.status(401).send('Unauthorized');
    }

    var fbid = decoded.fbid;
    var token = req.body.token;
    if (fbid != null) {
        try {
            const pool = await poolPromise
            const queryResult = await pool.request()
                .input('Opcion', sql.Int, 2)
                .input('FBID', sql.NVarChar, fbid)
                .input('TOKEN', sql.NVarChar, token)
                .execute('PA_POST_GET_Token')
            /*.query('IF EXISTS(SELECT * FROM Token WHERE FBID = FBID)'
                + ' UPDATE Token set Token = TOKEN WHERE FBID = FBID'
                + ' ELSE'
                + ' INSERT INTO Token (FBID, Token) OUTPUT Inserted.FBID, Inserted.Token'
                + ' VALUES(FBID, TOKEN)'
            );*/

            console.log(queryResult); //Debug to see

            if (queryResult.rowsAffected != null) {
                res.send(JSON.stringify({ success: true, message: "Success" }))
            }


        }
        catch (err) {
            res.status(500) //Internal Server Error
            res.send(JSON.stringify({ success: false, message: err.message }));
        }
    } else {
        res.send(JSON.stringify({ success: false, message: "Missing fbid in JWT" }));
    }

})

module.exports = router;
