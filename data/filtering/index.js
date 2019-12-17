const moment = require('moment')

const handleFilters = (filters, data) => {
	let nData = data
	console.log(nData)
	if (nData) {

		filters.forEach(f => {
			console.log('Filtering', f)
			switch (f.type) {
				case 'datetime':
					console.log('filtering by datetime')
					nData = nData.filter(d => {
						console.log(d, f.key)
						console.log(d[f.key], f.from, f.to)
						return moment(d[f.key]).valueOf() >= moment(f.from).valueOf() && moment(d[f.key]).valueOf() <= moment(f.to).valueOf()
					})
					break;

				default:
					break;
			}
		})
		return nData
	}
	else {
		return []
	}
}

module.exports = handleFilters
