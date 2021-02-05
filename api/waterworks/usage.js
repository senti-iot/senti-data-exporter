const { stringify } = require('csv')
const express = require('express')
const databrokerAPI = require('../engine')
const router = express.Router()

router.get('/v2/waterworks/usage/:type/:from/:to', (req, res) => {

	let type = req.params.type
	let bearerToken = req.bearer
	/**
	 *  Get the data
	 * */
	databrokerAPI.setHeader('Authorization', `Bearer ${bearerToken}`)

	let data = null


	/**
	 * Send the data back
	 */
	res.setHeader('Content-Type', 'text/csv')
	res.setHeader('Content-Disposition', 'attachment; filename=\"' + 'download-' + Date.now() + '.csv\"');
	switch (type) {
		case 'csv':
			return stringify(data, { header: true, delimiter: ';' })
				.pipe(res)
		case 'json':
			return res.status(200).json(data)
		default:
			break
	}

});


module.exports = router