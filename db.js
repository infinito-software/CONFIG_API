const sql = require('mssql')


var config = {
    user: 'sa',
    password: '@@Infinito1234',
    server: '167.114.106.184',
    database: 'BD_CONFIG'
};
 

const poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
        console.log('Conectado a SQL Server')
        return pool
    }).catch(err => console.log('Conexion Fallida', err))

module.exports = { sql, poolPromise}
