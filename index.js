const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000

var users = [
	{
		uid: 'uid1',
		email: 'email1@sap.com',
		isConsentGranted: true,
		consentLastModified: '2018-06-15T10:54:58.473Z',
		docVersion: 1.0		
	},
	{
		uid: 'uid2',
		email: 'email2@sap.com',
		isConsentGranted: false,
		consentLastModified: '2018-06-15T10:54:58.473Z',
		docVersion: 1.0		
	}
]

express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .get('/Test', (req, res) => res.render('pages/Test', {users:users}))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))