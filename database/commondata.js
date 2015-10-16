/*
	Database organization
	Collection: users, events.

	user property:
		_id: user id
		username -- need to be unique
		password
		eventIds
		balance
	event property:
		_id: event id
		name: event name -- need to be unique	
		members: username
		moneys:  money for each participater

*/


//use monk for mongodb connector
var Settings = require('./settings');  
var monk = require('monk');
var db = monk(Settings.URL);
module.exports = db;