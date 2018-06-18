const express = require('express')
const outboundRequest = require('request');
const path = require('path')
const PORT = process.env.PORT || 5000

express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .get('/Test', (req, res) => renderConsentUsers(req, res))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
  


  
function renderConsentUsers(req, res){
	
	var apikey = encodeURIComponent('3_pdjqlYp0QLnwmeMbuSUBcf99IbPd6_DfjYgkgZ6wRmsDR3DAM2-UQOJazI3vPs2F');
	var userKey = encodeURIComponent(process.env.userKey);
	var userSecret = encodeURIComponent(process.env.userSecret);
	var query = encodeURIComponent('select UID,preferences from accounts limit 30');
	var url = 'https://accounts.eu1.gigya.com/accounts.search?apikey='+apikey+'&userKey='+userKey+'&secret='+userSecret+'&query='+query;
	
	var getConsentObject = x => x.preferences.privacy.WebIDE_Privacy_Demo_1;
	
	outboundRequest(url, (error, inboundResponse, body) => {
		if (error || inboundResponse.statusCode != 200) {
			// TODO - Handle error
			console.log('Got error calling accounts.search');
			return;
		}
		
		var json = JSON.parse(body);
		if (json.errorCode != 0){
			console.log('accounts.search return failure error code');
			console.log(body);
			return;
		}
		
		var users = json.results.map(x => {
			var ret = {};
			ret.uid = x.UID;
			ret.email = '';
			if (x.preferences !== undefined){
				ret.isConsentGranted = getConsentObject(x).isConsentGranted;
				ret.consentLastModified = getConsentObject(x).lastConsentModified;
				ret.docVersion = getConsentObject(x).docVersion;
			}
			return ret;
		});
		
		res.render('pages/Test', {users:users})		
	});
};


	