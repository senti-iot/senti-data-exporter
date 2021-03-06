const createAPI = require('apisauce').create
// const crypto = require('crypto')

// const IV_LENGTH = 16

// const encrypt = (text) => {
// 	let iv = crypto.randomBytes(IV_LENGTH)
// 	let cipher = crypto.createCipheriv('aes-256-cbc', new Buffer.from(process.env.ENCRYPTION_KEY), iv)
// 	let encrypted = cipher.update(text)

// 	encrypted = Buffer.concat([encrypted, cipher.final()])

// 	return iv.toString('hex') + ':' + encrypted.toString('hex')
// }



// let engineAPI = createAPI({
// 	baseURL: 'http://127.0.0.1:3011/v1',
// 	'maxContentLength': Infinity,
// 	'maxBodyLength': Infinity,
// 	headers: {
// 		'Accept': 'application/json',
// 		'Content-Type': 'application/json',
// 		'auth': encrypt(process.env.ENCRYPTION_KEY)
// 	}
// })

let databrokerAPI = createAPI({
	baseURL: process.env.SENTI_DATABROKER,
	timeout: 300000,
	headers: {
		'Accept': 'application/json',
		'Content-Type': 'application/json'
	}
})
module.exports = databrokerAPI