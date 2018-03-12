var md5 = require('md5');
var connection = require('../modules/connection');
var responses = require('../modules/responses');
var comFunc = require('../modules/commonFunction');
//for login
exports.login = function(req,res) {
	var email = req.body.email;
	var	password = req.body.password;
	
	var sql = "SELECT * FROM `user1` WHERE `email` = ? AND `password`=?";
	var password = md5(password);
	var values = [email,password];
	console.log(123);
	connection.query(sql,values,function(err,result){
		console.log(result);
		if(err) {
			responses.sendError(res);
		} else{
			if(result.length>0)
			{
				result[0].password="";
				responses.success(res,result);
			}
			else{
				responses.sendError(res);
			}
			
		}
	})
}

// For signup
exports.signup = function(req, res) {
	var name = req.body.name;
	var email = req.body.email;
	var password = req.body.password;

	var manValue = [name, email, password];
	var checkBlank = comFunc.checkBlank(manValue);

	if ( checkBlank == 1 ) {
		responses.parameterMissing(res);
	} else {
		var sql = "SELECT * FROM `user1` WHERE `email`=?";
		connection.query(sql, [email], function(err, result){
			if ( err ) {
				responses.sendError(res);
			} else {
				if ( result.length > 0 ) {
					responses.emailAlreadyExist(res);
				} else {
					var user_id = md5(new Date());
					var access_token = md5(new Date());

					var insert_sql = "INSERT INTO `user1`(`user_id`, `access_token`, `name`, `email`, `password`) VALUES(?,?,?,?,?)";
					var values = [user_id, access_token, name, email, md5(password)];
					connection.query(insert_sql, values, function(err, result){
						if ( err ) {
							responses.sendError(res);
						} else {
							var sql = "SELECT * FROM `user1` WHERE `email`=?";
							connection.query(sql, [email], function(err, result){
								if ( err ) {
									responses.sendError(res);
								} else {
									result[0].password = "";
									responses.success(res, result[0]);
								}
							});
						}
					});
				}
			}
		});
	}
	    
}

//for poststatus
exports.post = function(req,res){
	// var poststatus = req.body.post;
	// var access_token = req.body.access_token;
	// console.log(poststatus);
	// console.log(access_token);
	// var sql = "UPDATE `user1` SET `post` = ? WHERE `access_token` = ?";
	// var	values = [poststatus,access_token];
	// connection.query(sql,values,function(err,result){
	// 	if (err) {
	// 		console.log("2");
	// 		responses.sendError(res);
	// 			} else {
	// 				console.log("run");
	// 				}
	// });
	var poststatus = req.body.post;
	var access_token = req.body.access_token;
	//console.log(req.body);
	var manValue = [poststatus,access_token]
	var checkBlank = comFunc.checkBlank(manValue);
	if ( checkBlank == 1 ) {
		responses.parameterMissing(res);
	} else {
		var uploaded_on = new Date();
		var post_id = md5(new Date());

	var sql = "SELECT `user_id` FROM `user1` where `access_token` = ?";
	var	values = [access_token];
	connection.query(sql,values,function(err,result){
		if(err) {
			console.log("err");
		} else {
			var user_id = result[0].user_id;
			console.log(user_id);
			console.log("runing");
			var sql = "INSERT INTO `post` (`post_id`,`user_id`,`post_data`,`uploaded_on`,`post_type`) VALUES (?,?,?,?,?)";
			values = [post_id,user_id,poststatus,uploaded_on,1];
			connection.query(sql,values,function(err,result){
				if(err) {
					responses.sendError(res);
				} else {
					responses.success(res,result[0]);
				}
			})
		}
	})
	}
}
 //show post
exports.viewUser = function(req, res){
 	var access_token = req.body.access_token;
 	console.log("hii");
 	var sql = "SELECT `user_id`,`name` from `user1` WHERE `access_token`= access_token";
 	connection.query(sql,[access_token],function(err,result){
 		if(err) {
 			console.log("error occure");
 			responses.sendError(res);
 		} else {
 			console.log("success");
 			//responses.success(res,result[0]);
 			res.send(result);
 		}
 	})
}
