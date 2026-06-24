const sql = require('mssql')


var config = {
    user: 'InfinitoAdmin',
    password: '@1nf1n1t0d@t@',
    server: '161.132.56.51',
    database: 'BD_CONFIG'
};
 

const poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
        console.log('Conectado a SQL Server')
        return pool
    }).catch(err => console.log('Conexion Fallida', err))

module.exports = { sql, poolPromise}
