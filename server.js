#!/usr/bin/env nodejs
//eslint-disable-next-line
const dotenv = require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const app = express()
const Endpoint = require('./api/index.js')
// API endpoint imports
const port = process.env.NODE_PORT || 3021

app.use(helmet())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

/**
 * API
 */
app.use([Endpoint])
app.use(cors())


//---Start the express server---------------------------------------------------

const startServer = () => {
	app.listen(port, () => {
		console.log('Senti Data Exporter Service started on port', port)
	}).on('error', (err) => {
		if (err.errno === 'EADDRINUSE') {
			console.log('Service not started, port ' + port + ' is busy')
		} else {
			console.log(err)
		}
	})
}

startServer()
