
// const { stringify } = require('csv')
var mysqlConn = require('../../mysql/mySqlConn')
var engineAPI = require('../../api/engine')

let deviceDataQuery = (JSONFields, fields) => `SELECT
		${JSONFields.map(f => `dd.data->'$.${f.field}' as ${f.label}`)},
		${fields.map((f) => `dd.${f.field} as ${f.label}`)}
	FROM
		(
		SELECT
			d.id
		FROM
			Customer c
		INNER JOIN Registry r on
			c.id = r.customer_id
		INNER JOIN Device d on
			r.id = d.reg_id
		WHERE
			c.ODEUM_org_id = ? ) t
	INNER JOIN Device_data_clean dd FORCE INDEX (index4) ON
		t.id = dd.device_id
	WHERE
		dd.data->'$.time' >= ?
	AND
		dd.data->'$.time' <= ?
	ORDER BY
		dd.created;`
async function asyncForEach(array, callback) {
	for (let index = 0; index < array.length; index++) {
		await callback(array[index], index, array);
	}
}
const getDeviceData = async (config) => {
	let period = config.period
	console.log(config)
	let JSONFields = config.columns.filter(c => c.type).map(c => ({ field: c.field, label: c.label }))
	let fields = config.columns.filter(c => !c.type).map(c => ({ field: c.field, label: c.label }))
	// console.log(JSONFields, fields)
	let customerId = config.customerId
	let final = []
	// console.log(mysqlConn.format(deviceDataQuery(JSONFields, fields), [customerId, period.from, period.to]))
	final = await mysqlConn.query(deviceDataQuery(JSONFields, fields), [customerId, period.from, period.to])
		.then(async ([cleanData]) => {
			let data = cleanData
			let cfColumns = config.columns.filter(c => c.cf)
			if (cfColumns.length > 0) {
				await asyncForEach(cfColumns, (async c => {
					let cData = await engineAPI.post('/', { nIds: [c.cf], data: data }).then((rss) => {
						console.log(rss.ok)
						return rss.ok ? rss.data : null
					})
					console.log('cData', cData[0])
					if (cData) {
						data = cData
						console.log('Assigning new data to final', data[0])
					}
				}))
			}
			else {
				console.log('noCFs')
				data = cleanData
			}
			// console.log(cleanData)
			return data
		})
		.catch(err => {
			console.log(err, deviceDataQuery)
			return err
			// res.status(500).json({ err, deviceDataQuery })
		})
	console.log('Returning data', final[0])
	return final

}

// router.get('/:version/deviceDataByCustomerID/:customerId/:field/:from/:to/:nId', async (req, res) => {
// let apiV = req.params.version
// let authToken = req.headers.auth
// let customerId = req.params.customerId
// let from = req.params.from
// let to = req.params.to
// let field = req.params.field
// // let nId = req.params.nId
// if (verifyAPIVersion(apiV)) {

// 	if (authenticate(authToken)) {

// 		console.log(mysqlConn.format(deviceDataQuery, ['$.' + field, field, customerId, from, to]))
// 		await mysqlConn.query(deviceDataQuery, ['$.' + field, field, customerId, from, to]).then(rs => {
// 			let cleanData = rs[0]
// 			return res.status(200).json(cleanData)
// 		}).catch(err => {
// 			console.log(err, deviceDataQuery)
// 			res.status(500).json({ err, deviceDataQuery })
// 		})
// 	}
// 	return res.status(500).json("Error: Invalid token")
// }
// return res.status(500).json("Error: Invalid Version")
// })
// router.get('/:version/devices/csv', async (reg, res) => {
// 	res.setHeader('Content-Type', 'text/csv');
// 	res.setHeader('Content-Disposition', 'attachment; filename=\"' + 'download-' + Date.now() + '.csv\"');
// 	await mysqlConn.query(getDevicesQuery).then(rs => {

// 		stringify(rs[0], {
// 			header: true
// 		})
// 			.pipe(res);
// 	})
// })

module.exports = {
	getDeviceData
}