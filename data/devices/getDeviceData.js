
// const { stringify } = require('csv')
var mysqlConn = require('../../mysql/mySqlConn')
var engineAPI = require('../../api/engine')
var moment = require('moment')

let compareType = (type) => {
	switch (type) {
		case 'equal':
			return '='
		case 'higher':
			return ">"
		case 'lower':
			return '<'
		case 'higherequal':
			return ">="
		case 'lowerequal':
			return '<='
		default:
			break;
	}
}
let deviceDataQuery = (JSONFields, fields, deviceFields, filters) => `SELECT
		${deviceFields.map(fd => `t.${fd.field}`)}${JSONFields.length > 0 ? ',' : ''}
		${JSONFields.map(f => `dd.data->'$.${f.field}' as ${f.field}`)}${fields.length > 0 ? ',' : ''}
		${fields.map((f) => `dd.${f.field}`)}
	FROM
		(
		SELECT
			d.*
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
		${filters.map((f) => `AND ${f.key}${compareType(f.type)}${f.value}`).join(' ')}
	AND
		dd.data->'$.time' <= ?
	ORDER BY
		dd.created;`
async function asyncForEach(array, callback) {
	for (let index = 0; index < array.length; index++) {
		await callback(array[index], index, array);
	}
}
const getDeviceData = async (config, filters) => {
	try {

		let period = config.period
		console.log(config)
		let JSONFields = config.columns.filter(c => c.type == 'json').map(c => ({ field: c.field, label: c.label }))
		let fields = config.columns.filter(c => !c.type).map(c => ({ field: c.field, label: c.label }))
		let deviceFields = config.columns.filter(c => c.type === 'device')

		console.log(JSONFields, fields, deviceFields)
		let customerId = config.customerId
		let final = []
		console.log(mysqlConn.format(deviceDataQuery(JSONFields, fields, deviceFields, filters), [customerId, moment(period.from).format('YYYY-MM-DD'), moment(period.to).format('YYYY-MM-DD')]))
		final = await mysqlConn.query(deviceDataQuery(JSONFields, fields, deviceFields, filters), [customerId, moment(period.from).format('YYYY-MM-DD'), moment(period.to).format('YYYY-MM-DD')])
			.then(async ([cleanData]) => {
				let data = cleanData
				let cfColumns = config.columns.filter(c => c.cf)
				if (cfColumns.length > 0) {
					await asyncForEach(cfColumns, (async c => {
						let cData = await engineAPI.post('/', { nIds: [c.cf], data: data }).then((rss) => {
							console.log(rss.ok)
							return rss.ok ? rss.data : null
						})
						if (cData) {
							data = cData
							console.log('Assigning new data to final', data[0], cData[0])
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
	catch (e) {
		console.log(e)
		return []
	}

}

module.exports = {
	getDeviceData
}