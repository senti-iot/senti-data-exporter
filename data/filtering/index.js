const moment = require('moment')

const handleFilters = (filters, data) => {
	let nData = data
	if (nData) {

		filters.forEach(f => {
			console.log('Filtering', f)
			switch (f.type) {
				case 'datetime':
					console.log('filtering by datetime')
					nData = nData.filter(d => {
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
