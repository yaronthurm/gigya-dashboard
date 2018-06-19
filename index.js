const express = require('express')
const outboundRequest = require('request');
const path = require('path')
const PORT = process.env.PORT || 5000

express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .get('/consent-users', (req, res) => renderConsentUsers(req, res))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
  


  
function renderConsentUsers(req, res){
	
	var apikey = encodeURIComponent('3_HJZUjKpjd2FCO-hxLCDiOAVlFsznc7XilpDP-Z4AR_ifNRhB3MZUOP0chnwoIWoG');
	var userKey = encodeURIComponent(process.env.userKey);
	var userSecret = encodeURIComponent(process.env.userSecret);
	var query = encodeURIComponent('select UID,preferences,created from accounts order by lastUpdated desc limit 30');
	var url = 'https://accounts.eu1.gigya.com/accounts.search?apikey='+apikey+'&userKey='+userKey+'&secret='+userSecret+'&query='+query;
	
	var pathToConsent = '';
	if (req.query.policy === '1')
		pathToConsent = 'WebIDE_Privacy_Demo_1'
	else if (req.query.policy === '2')
		pathToConsent = 'WebIDE_Demo_2'
	else if (req.query.policy === '3')
		pathToConsent = 'WebIDE_Demo_3'
	else {
		res.render('pages/Error', {error:'Invalid value for policy param. Supported values are 1, 2, 3', details: ''});
		return;
	}
	var getConsentObject = x => x.preferences.privacy[pathToConsent];
	
	
	outboundRequest(url, (error, inboundResponse, body) => {
		if (error || inboundResponse.statusCode != 200) {
			res.render('pages/Error', {error:'Failed calling Gigya (accounts.search)', details: body});
			return;
		}
		
		var json = JSON.parse(body);
		if (json.errorCode != 0){
			res.render('pages/Error', {error:'Got error from Gigya (accounts.search)', details: body });
			return;
		}
		
		var users = json.results.map(x => {
			var ret = {};
			ret.uid = x.UID;
			ret.created = x.created;
			if (x.preferences !== undefined){
				var consentObject = getConsentObject(x);
				if (consentObject !== undefined) {
					ret.isConsentGranted = getConsentObject(x).isConsentGranted;
					ret.consentLastModified = getConsentObject(x).lastConsentModified;
					ret.docVersion = getConsentObject(x).docVersion;
				}
			}
			return ret;
		});
		
		res.render('pages/ConsentUsers', {users:users, time: json.time, consentPath: pathToConsent});
	});
};


	