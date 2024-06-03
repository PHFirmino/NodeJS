var knex = require('knex')({
    
    client: 'mysql2',
    connection: {
        host : 'localhost',
        user : 'root',
        password : '',
        database : 'nodejs'
    }
});

module.exports = knex