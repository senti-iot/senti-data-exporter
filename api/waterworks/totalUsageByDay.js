const { stringify } = require('csv')
const express = require('express')
const databrokerAPI = require('../engine')
const router = express.Router()


/**
 * Admin Usage
 */
router.get('/v2/waterworks/usage/:type/:orgUUID/:from/:to', async (req, res) => {

	let type = req.params.type
	let bearerToken = req.bearer
	let from = req.params.from
	let to = req.params.to
	let orgUUID = req.params.orgUUID
	/**
	 *  Get the data
	 * */
	databrokerAPI.setHeader('Authorization', `Bearer ${bearerToken}`)

	let data = await databrokerAPI.get(`/v2/waterworks/data/totalusagebyday/${orgUUID}/${from}/${to}`).then(rs => rs.data)


	/**
	 * Send the data back
	 */

	console.log('type', type)
	switch (type) {
		case 'csv':
			res.setHeader('Content-Type', 'text/csv')
			res.setHeader('Content-Disposition', 'attachment; filename=\"' + 'download-' + Date.now() + '.csv\"');

			// await res.status(200).attachment('download-' + Date.now() + '.csv\"').send()
			stringify(data, { header: true, delimiter: ';' }).pipe(res)
			// stringify(data, { header: true, delimiter: ';' })
			// .pipe(res)
			return
		case 'json':
			return res.status(200).json(data)
		default:
			break
	}

});


module.exports = router