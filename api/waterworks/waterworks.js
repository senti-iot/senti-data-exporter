const archiver = require('archiver')
const { stringify } = require('csv')
const express = require('express')
const databrokerAPI = require('../engine')
const router = express.Router()
const moment = require('moment')

/**
 * User Usage
 */
// post /v2/waterworks/export
/**
 * @URL v2/waterworks/export
 * @param {Object} body
 * @param {uuid} body.orgUUID
 * @param {Array} body.fields
 * @param {Date} body.from
 * @param {Date} body.to
 * @param {boolean} body.isAdmin
 * @param {Array<(uuid: uuids)>} body.uuids
 */
router.post('/v2/waterworks/export', async (req, res) => {
	const archive = archiver('zip', {
		zlib: { level: 9 } // Sets the compression level.
	});
	let type = req.body.type
	let bearerToken = req.bearer
	let from = req.body.from
	let to = req.body.to
	let orgUUID = req.body.orgUUID
	let isAdmin = req.body.isAdmin
	let fields = req.body.fields
	let uuids = req.body.uuids
	let dateFormat = req.body.dateFormat
	let dateLang = req.body.dateLang
	//#region Get the data

	/**
	 * Set the Authorization token for dataBroker
	 */
	let data = {
		usage: null,
		benchmark: null,
		temperature: null,
		reading: null
	}
	databrokerAPI.setHeader('Authorization', `Bearer ${bearerToken}`)
	console.log('Getting Data')
	/**
	 * Admin Data
	 */
	if (isAdmin) {

		if (fields.includes('usage')) {
			if (uuids) {
				console.log('Getting Usage as Admin')
				data.usage = await databrokerAPI.post(`/v2/waterworks/data/usagebyday/${from}/${to}`, uuids).then(rs => rs.data)
			}
			else {
				console.log('Getting Usage as Admin')
				data.usage = await databrokerAPI.get(`/v2/waterworks/data/totalusagebyday/${orgUUID}/${from}/${to}`).then(rs => rs.data)
			}

		}
		if (fields.includes('benchmark')) {
			console.log('Getting Benchmark as Admin')

			if (uuids) {
				data.benchmark = await databrokerAPI.post(`/v2/waterworks/data/custom-benchmark/${from}/${to}`, uuids).then(rs => rs.data)
			}
			else {
				data.benchmark = await databrokerAPI.get(`/v2/waterworks/data/benchmark/${orgUUID}/${from}/${to}`).then(rs => rs.data)
			}
		}
		if (fields.includes('temperature')) {

		}
		if (fields.includes('reading')) {
			console.log('Getting Reading as Admin')

			if (uuids) {
				data.reading = await databrokerAPI.post(`/v2/waterworks/data/volume/${from}/${to}`, uuids).then(rs => rs.data)
			}
			else {
				data.reading = await databrokerAPI.get(`/v2/waterworks/data/volume/${from}/${to}`).then(rs => rs.data)
			}
		}
	}
	/**
	 * User Data
	 */
	else {
		if (fields.includes('usage')) {
			if (uuids) {
				data.usage = await databrokerAPI.post(`/v2/waterworks/data/usagebyday/${from}/${to}`, uuids).then(rs => rs.data)
			}
			else {
				data.usage = await databrokerAPI.get(`/v2/waterworks/data/usagebyday/${from}/${to}`).then(rs => rs.data)
			}

		}
		if (fields.includes('benchmark')) {
			if (uuids) {
				data.benchmark = await databrokerAPI.post(`/v2/waterworks/data/custom-benchmark/${from}/${to}`, uuids).then(rs => rs.data)
			}
			else {
				data.benchmark = databrokerAPI.get(`/v2/waterworks/data/benchmark/${orgUUID}/${from}/${to}`).then(rs => rs.data)
			}
		}
		if (fields.includes('temperature')) {

		}
		if (fields.includes('reading')) {
			if (uuids) {
				data.reading = await databrokerAPI.post(`/v2/waterworks/data/volume/${from}/${to}`, uuids).then(rs => rs.data)
			}
			else {
				data.reading = await databrokerAPI.get(`/v2/waterworks/data/volume/${from}/${to}`).then(rs => rs.data)
			}
		}

	}

	/**
	 * Date Time formatting
	 */
	if (dateFormat) {
		if (!moment(moment().format(dateFormat)).isValid()) {
			return res.status(400).json({ error: 'Invalid date format' })
		}

		if (dateLang) {
			moment.locale(dateLang)
		}
		if (data.usage)
			data.usage = data.usage.map(u => ({ ...u, datetime: moment(u.datetime).format(dateFormat) }))
		if (data.benchmark)
			data.benchmark = data.benchmark.map(u => ({ ...u, datetime: moment(u.datetime).format(dateFormat) }))
		if (data.temperature)
			data.temperature = data.temperature.map(u => ({ ...u, datetime: moment(u.datetime).format(dateFormat) }))
		if (data.reading)
			data.reading = data.reading.map(u => ({ ...u, datetime: moment(u.datetime).format(dateFormat) }))

	}
	/**
	 * Send the data back
	 */
	let dateForm = () => {
		return moment(from).format('YYYY-MM-DD_HH-mm') + ' - ' + moment(to).format('YYYY-MM-DD_HH-mm')
	}
	console.log('type', type)
	switch (type) {
		case 'csv':
			res.setHeader('Content-Type', 'application/zip')
			res.setHeader('Content-Disposition', 'attachment; filename=\"' + 'SW-export-' + moment().format('YYYY-MM-DD_HH-mm') + '.zip\"')
			// await res.status(200).attachment('download-' + Date.now() + '.csv\"').send()
			data.usage ? archive.append(stringify(data.usage, { header: true, delimiter: ';' }), { name: 'SW-export-usage-' + dateForm() + '.csv' }) : null
			data.benchmark ? archive.append(stringify(data.benchmark, { header: true, delimiter: ';' }), { name: 'SW-export-benchmark-' + dateForm() + '.csv' }) : null
			data.temperature ? archive.append(stringify(data.temperature, { header: true, delimiter: ';' }), { name: 'SW-export-temperature-' + dateForm() + '.csv' }) : null
			data.reading ? archive.append(stringify(data.reading, { header: true, delimiter: ';' }), { name: 'SW-export-reading-' + dateForm() + '.csv' }) : null
			console.log('Done archiving data')
			console.log('Sending data')
			archive.pipe(res)
			archive.finalize();
			// stringify(data, { header: true, delimiter: ';' })
			// .pipe(res)
			break
		case 'json':
			res.setHeader('Content-Type', 'application/zip')
			res.setHeader('Content-Disposition', 'attachment; filename=\"' + 'SW-export-' + moment().format('YYYY-MM-DD_HH-mm') + '.zip\"')
			// await res.status(200).attachment('download-' + Date.now() + '.csv\"').send()
			data.usage ? archive.append(JSON.stringify(data.usage), { name: 'SW-export-usage-' + dateForm() + '.json' }) : null
			data.benchmark ? archive.append(JSON.stringify(data.benchmark), { name: 'SW-export-benchmark-' + dateForm() + '.json' }) : null
			data.temperature ? archive.append(JSON.stringify(data.temperature), { name: 'SW-export-temperature-' + dateForm() + '.json' }) : null
			data.reading ? archive.append(JSON.stringify(data.reading), { name: 'SW-export-reading-' + dateForm() + '.json' }) : null
			console.log('Done archiving data')
			console.log('Sending data')
			archive.pipe(res)
			archive.finalize()
			break
		default:
			break
	}

})

module.exports = router