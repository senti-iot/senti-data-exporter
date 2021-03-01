#!/usr/bin/env nodejs
//eslint-disable-next-line
const dotenv = require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const app = express()

// ACL Client

const sentiAuthClient = require('senti-apicore').sentiAuthClient
const authClient = new sentiAuthClient(process.env.AUTHCLIENTURL, process.env.PASSWORDSALT)
module.exports.authClient = authClient

const sentiAclBackend = require('senti-apicore').sentiAclBackend
const sentiAclClient = require('senti-apicore').sentiAclClient

const aclBackend = new sentiAclBackend(process.env.ACLBACKENDTURL)
const aclClient = new sentiAclClient(aclBackend)
module.exports.aclClient = aclClient

// API endpoint imports
// const Endpoint = require('./api/index.js')
const auth = require('./api/auth')
const waterWorksUsage = require('./api/waterworks/usage')
const waterWorksExport = require('./api/waterworks/waterworks')

const port = process.env.NODE_PORT || 3021

app.use(helmet())
app.use(express.json())
app.use(express.text())
app.use(express.urlencoded({ extended: true, limit: '150mb' }))


/**
 * API
 */
app.use(cors())
// app.options('*', cors())
// app.use([Endpoint])
app.use([auth, waterWorksUsage, waterWorksExport])
var allRoutes = require('./lib/routeLogger')

//---Start the express server---------------------------------------------------

const startServer = () => {
	console.log('Booting up')
	allRoutes(app)
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
