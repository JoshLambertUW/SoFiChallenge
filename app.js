const express = require('express');
const app = express();
const port = 3000

app.use(express.json())

var router = require('./routes');
app.use('/', router);

app.listen(port, function(req, res){
	console.log('Server is running on port: ', port);
});
