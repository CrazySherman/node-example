A simple login system web application -- (refering to web tab in chrome bookmark, app.js and index.js and "database" subdirectory)

Features: 
1. support http session, using connect-mongodb middle as storage for session data.
2. use ejs(app.set('view engine', 'ejs')) template for rendering html style views. (refering to "view" subdirectory)
3. bootstrap and jquery UI library (public/stylesheet)

Core information:
	request paths: 	/home	/login	/logout  /
	db user: admint, password: 123456



Note: 
	res.redirect() cannot be called multiple times in a single function. Make sure to separate logic 
	