require('dotenv').config()
const mysql = require('mysql2');

const { DB_HOST, DB_USER, DATABASE, PASSWORD } = process.env

let connection = mysql.createPool({
	host: DB_HOST,
	user: DB_USER,
	password: PASSWORD,
	database: DATABASE,
	multipleStatements: true,
	waitForConnections: true,
	connectionLimit: 10,
	queueLimit: 0
})

connection = connection.promise()

module.exports = connection