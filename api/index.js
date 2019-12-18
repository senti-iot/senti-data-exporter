const express = require('express')
const router = express.Router()
const verifyAPIVersion = require('senti-apicore').verifyapiversion
const { authenticate } = require('senti-apicore')
const getDeviceData = require('../data/devices/getDeviceData').getDeviceData
const handleFilters = require('../data/filtering/index')
const { stringify } = require('csv')

router.post('/:version/export', async (req, res) => {
	let version = req.params.version
	let authToken = req.headers.auth
	if (verifyAPIVersion(version)) {
		if (authenticate(authToken)) {
			let body = req.body
			let filters = body.config.filters.pre
			let data = await getDeviceData(body.config, filters)
			res.setHeader('Content-Type', 'text/csv');
			res.setHeader('Content-Disposition', 'attachment; filename=\"' + 'download-' + Date.now() + '.csv\"');
			let postFilters = body.config.filters.post
			if (postFilters && postFilters.length > 0) {
				console.log('******* FILTERING DATA *******')
				data = handleFilters(postFilters, data)
				console.log('*** Filtered data ***')
				console.log(data.slice(0, 10))
			}
			console.log('Sending Data')
			return stringify(data, { header: true, delimiter: ';' })
				.pipe(res);
			// return res.send(data)
		}
		return res.status(500).json("Error: Invalid token")
	}
	return res.status(500).json("Error: Invalid Version")
})


module.exports = router
