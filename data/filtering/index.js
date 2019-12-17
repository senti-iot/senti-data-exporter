const moment = require('moment')

const handleFilters = (filters, data) => {
	let nData = data
	if (nData && nData.length > 0) {

		filters.forEach(f => {

			switch (f.type) {
				case 'datetime':
					console.log('filtering by datetime')
					nData = nData.filter(d => {
						return moment(d[f.key]).valueOf() >= moment(f.from).valueOf() && moment(d[f.key]).valueOf() <= moment(f.to).valueOf() ? true : false
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
