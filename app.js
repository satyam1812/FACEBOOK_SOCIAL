var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var md5 = require('md5');
var multer = require('multer');

var app = express();
var port = process.env.port || 3008; 

var storage = multer.diskStorage({
	destination:function(req,file,callback) {
		callback(null,'./uploads/user');
	},
	filename:function(req,file,callback) {
		var fileUniqueName = md5(Date.now());
		 callback(null,  fileUniqueName + path.extname(file.originalname));
	}
});
var upload = multer({storage:storage});

app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'view')));

var user_panel = require('./routes/user');

app.post('/user/signup', user_panel.signup);
app.post('/user/login', user_panel.login);
app.post('/user/post', user_panel.post);
app.post('/user/get_post_list', user_panel.get_post_list);
app.post('/user/like', user_panel.like);
app.post('/user/post_comment', user_panel.post_comment);


app.listen(port, function(){
	console.log("Server is running on port "+port);
});