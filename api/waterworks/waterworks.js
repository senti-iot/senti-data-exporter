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
	})
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
	let locale = req.body.locale

	if (fields.length < 1) {
		return res.send(400).json({
			error: "No fields specified"
		})
	}
	//#region Get the data

	/**
	 * Set the Authorization token for dataBroker
	 */
	let data = {
		usage: null,
		benchmark: null,
		temperature: {
			minATemp: null,
			minWTemp: null
		},
		reading: null,
		waterflow: {
			minFlow: null,
			maxFlow: null
		}
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
			/**
			 * Min. Ambient Temp.
			 */
			if (uuids) {
				data.temperature.minATemp = await databrokerAPI.post(`/v2/waterworks/data/minATemp/${from}/${to}`, uuids).then(rs => rs.data)
			}
			else {
				data.temperature.minATemp = await databrokerAPI.get(`/v2/waterworks/data/minATemp/${from}/${to}`).then(rs => rs.data)
			}
			/**
			 * Min. Water Temp.
			 */
			if (uuids) {
				data.temperature.minWTemp = await databrokerAPI.post(`/v2/waterworks/data/minWTemp/${from}/${to}`, uuids).then(rs => rs.data)
			}
			else {
				data.temperature.minWTemp = await databrokerAPI.get(`/v2/waterworks/data/minWTemp/${from}/${to}`).then(rs => rs.data)
			}
		}
		if (fields.includes('waterflow')) {
			/**
			 * Min Flow
			 */
			if (uuids) {
				data.waterflow.minFlow = await databrokerAPI.post(`/v2/waterworks/data/minFlow/${from}/${to}`, uuids).then(rs => rs.data)
			}
			else {
				data.waterflow.minFlow = await databrokerAPI.get(`/v2/waterworks/data/minFlow/${from}/${to}`).then(rs => rs.data)
			}
			/**
			 * Max Flow
			 */
			if (uuids) {
				data.waterflow.maxFlow = await databrokerAPI.post(`/v2/waterworks/data/maxFlow/${from}/${to}`, uuids).then(rs => rs.data)
			}
			else {
				data.waterflow.maxFlow = await databrokerAPI.get(`/v2/waterworks/data/maxFlow/${from}/${to}`).then(rs => rs.data)
			}
		}
		if (fields.includes('reading')) {
			console.log('Getting Reading as Admin')

			if (uuids) {
				data.reading = await databrokerAPI.post(`/v2/waterworks/data/volume/${from}/${to}`, uuids).then(rs => rs.data)
				if (fields.includes('firstLast')) {
					let finalArr = []
					let flippedArr = [...data.reading].reverse()
					uuids.forEach(id => {
						finalArr.push(data.reading[data.reading.findIndex(f => f.uuid === id)])
						finalArr.push(flippedArr[flippedArr.findIndex(f => f.uuid === id)])
					});
					// newArr.push(data.reading.shift())
					// newArr.push(data.reading.pop())
					data.reading = finalArr.sort((a, b) => a.uuid - b.uuid) //Sort it
				}
			}
			else {
				data.reading = await databrokerAPI.get(`/v2/waterworks/data/volume/${from}/${to}`).then(rs => rs.data)
				if (fields.includes('firstLast')) {

					let allUUIDs = [...new Set(data.reading.map(item => item.uuid))]
					let flippedArr = [...data.reading].reverse()
					let finalArr = []
					allUUIDs.forEach(id => {
						finalArr.push(data.reading[data.reading.findIndex(f => f.uuid === id)])
						finalArr.push(flippedArr[flippedArr.findIndex(f => f.uuid === id)])
					});
					data.reading = finalArr.sort((a, b) => a.uuid - b.uuid) //Sort it
				}
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
		if (fields.includes('reading')) {
			if (uuids) {
				data.reading = await databrokerAPI.post(`/v2/waterworks/data/volume/${from}/${to}`, uuids).then(rs => rs.data)
			}
			else {
				data.reading = await databrokerAPI.get(`/v2/waterworks/data/volume/${from}/${to}`).then(rs => rs.data)
			}
		}

	}

	console.log(data.waterflow)
	console.log(data.temperature)
	/**
	 * Date Time formatting
	 */
	if (dateFormat) {
		console.log('Date Format', moment(moment().format(dateFormat)).isValid())
		if (!moment(moment().format(dateFormat)).isValid()) {
			return res.status(500).json({ error: 'Invalid date format' })
		}

		if (dateLang) {
			moment.locale(dateLang)
		}
		if (data.usage)
			data.usage = data.usage.map(u => {

				return { ...u, datetime: moment(u.datetime).format(dateFormat) }
			})
		if (data.benchmark)
			data.benchmark = data.benchmark.map(u => ({ ...u, datetime: moment(u.datetime).format(dateFormat) }))
		if (data.temperature.minWTemp) {
			data.temperature.minWTemp = data.temperature.minWTemp.map(u => ({ ...u, datetime: moment(u.datetime).format(dateFormat) }))
		}
		if (data.temperature.minATemp) {
			data.temperature.minATemp = data.temperature.minATemp.map(u => ({ ...u, datetime: moment(u.datetime).format(dateFormat) }))
		}
		if (data.waterflow.maxFlow) {
			data.waterflow.maxFLow = data.waterflow.maxFlow.map(u => ({ ...u, datetime: moment(u.datetime).format(dateFormat) }))
		}
		if (data.waterflow.minFlow) {
			data.waterflow.minFlow = data.waterflow.minFlow.map(u => ({ ...u, datetime: moment(u.datetime).format(dateFormat) }))
		}
		if (data.reading)
			data.reading = data.reading.map(u => ({ ...u, datetime: moment(u.datetime).format(dateFormat) }))

	}
	if (locale) {
		console.log('Locale Format', locale)
		if (locale !== 'en-US' && locale !== 'da-DK') {
			return res.status(500).json({ error: 'Unsuported locale' })
		}
		if (data.usage)
			data.usage = data.usage.map(u => {
				let keys = Object.keys(u)
				let obj = u
				keys.map(key => {
					if (Number(u[key])) {
						obj[key] = obj[key].toLocaleString(locale)
					}
				})
				return { ...obj, datetime: moment(u.datetime).format(dateFormat) }
			})
		if (data.benchmark)
			data.benchmark = data.benchmark.map(u => {
				let keys = Object.keys(u)
				let obj = u
				keys.map(key => {
					if (Number(u[key])) {
						obj[key] = obj[key].toLocaleString(locale)
					}
				})
				return { ...obj, datetime: moment(u.datetime).format(dateFormat) }
			})
		if (data.temperature.minWTemp) {
			data.temperature.minWTemp = data.temperature.minWTemp.map(u => {
				let keys = Object.keys(u)
				let obj = u
				keys.map(key => {
					if (Number(u[key])) {
						obj[key] = obj[key].toLocaleString(locale)
					}
				})
				return { ...obj, datetime: moment(u.datetime).format(dateFormat) }
			})
		}
		if (data.temperature.minATemp) {
			data.temperature.minATemp = data.temperature.minATemp.map(u => {
				let keys = Object.keys(u)
				let obj = u
				keys.map(key => {
					if (Number(u[key])) {
						obj[key] = obj[key].toLocaleString(locale)
					}
				})
				return { ...obj, datetime: moment(u.datetime).format(dateFormat) }
			})
		}
		if (data.waterflow.maxFlow) {
			data.waterflow.maxFLow = data.waterflow.maxFlow.map(u => {
				let keys = Object.keys(u)
				let obj = u
				keys.map(key => {
					if (Number(u[key])) {
						obj[key] = obj[key].toLocaleString(locale)
					}
				})
				return { ...obj, datetime: moment(u.datetime).format(dateFormat) }
			})
		}
		if (data.waterflow.minFlow) {
			data.waterflow.minFlow = data.waterflow.minFlow.map(u => {
				let keys = Object.keys(u)
				let obj = u
				keys.map(key => {
					if (Number(u[key])) {
						obj[key] = obj[key].toLocaleString(locale)
					}
				})
				return { ...obj, datetime: moment(u.datetime).format(dateFormat) }
			})
		}
		if (data.reading)
			data.reading = data.reading.map(u => {
				let keys = Object.keys(u)
				let obj = u
				keys.map(key => {
					if (Number(u[key])) {
						obj[key] = obj[key].toLocaleString(locale)
					}
				})
				return { ...obj, datetime: moment(u.datetime).format(dateFormat) }
			})

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
			/**
			 * Archiving the data
			 */
			//Usage
			data.usage ? archive.append(stringify(data.usage, { header: true, delimiter: ';' }), { name: 'SW-export-usage-' + dateForm() + '.csv' }) : null
			//Benchmark
			data.benchmark ? archive.append(stringify(data.benchmark, { header: true, delimiter: ';' }), { name: 'SW-export-benchmark-' + dateForm() + '.csv' }) : null
			//Temperatures
			data.temperature.minATemp ? archive.append(stringify(data.temperature.minATemp, { header: true, delimiter: ';' }), { name: 'SW-export-temp-minAmbientTemp-' + dateForm() + '.csv' }) : null
			data.temperature.minWTemp ? archive.append(stringify(data.temperature.minWTemp, { header: true, delimiter: ';' }), { name: 'SW-export-temp-minWaterTemp' + dateForm() + '.csv' }) : null
			//Waterflow
			data.waterflow.minFlow ? archive.append(stringify(data.waterflow.minFlow, { header: true, delimiter: ';' }), { name: 'SW-export-waterflow-minFlow-' + dateForm() + '.csv' }) : null
			data.waterflow.maxFlow ? archive.append(stringify(data.waterflow.maxFlow, { header: true, delimiter: ';' }), { name: 'SW-export-waterflow-maxFlow-' + dateForm() + '.csv' }) : null
			//Reading
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
			data.temperature.minWTemp ? archive.append(JSON.stringify(data.temperature.minWTemp), { name: 'SW-export-temperature-minWTemp-' + dateForm() + '.json' }) : null
			data.temperature.minATemp ? archive.append(JSON.stringify(data.temperature.minATemp), { name: 'SW-export-temperature-minATemp-' + dateForm() + '.json' }) : null
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