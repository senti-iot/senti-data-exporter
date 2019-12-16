const express = require('express')
const router = express.Router()
const verifyAPIVersion = require('senti-apicore').verifyapiversion
const { authenticate } = require('senti-apicore')
const getDeviceData = require('../data/devices/getDeviceData').getDeviceData
const { stringify } = require('csv')
router.post('/:version/export', async (req, res) => {
	let version = req.params.version
	let authToken = req.headers.auth
	if (verifyAPIVersion(version)) {
		if (authenticate(authToken)) {
			let body = req.body
			let data = await getDeviceData(body.config)
			res.setHeader('Content-Type', 'text/csv');
			res.setHeader('Content-Disposition', 'attachment; filename=\"' + 'download-' + Date.now() + '.csv\"');
			console.log('Processed data', data[0])
			return stringify(data, { header: true })
				.pipe(res);
			// return res.send(data)
		}
		return res.status(500).json("Error: Invalid token")
	}
	return res.status(500).json("Error: Invalid Version")
})


module.exports = router
