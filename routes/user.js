var md5 = require('md5');
var connection = require('../modules/connection');
var responses = require('../modules/responses');
var comFunc = require('../modules/commonFunction');
var async = require ('async');
var _ =require('lodash');
//for login
var arr = [];
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
						var sql = "SELECT * FROM `post` WHERE `post_id`=?";
						connection.query(sql, [post_id], function(err, result){
							if ( err ) {
								responses.sendError(res);
							} else {
								responses.success(res,result[0]);
							}
						});
					}
				})
			}
		});
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

// exports.get_post_list = function(req,res) {
// 	var access_token = req.body.access_token;
// 	var manValue = [access_token];
// 	var checkBlank = comFunc.checkBlank(manValue);

// 	if ( checkBlank == 1 ) {
// 		responses.parameterMissing(res);
// 	} else {
// 		var user_id;
// 		var user_sql = "SELECT * FROM `user1` WHERE `access_token`=?";
// 		connection.query(user_sql, [access_token], function(err, userresult){
// 			if ( err ) {
// 				responses.sendError(res);
// 			} else {
// 				if ( userresult.length == 0 ) {
// 					responses.invalidAccessToken(res);
// 				} else {
// 					var post_sql = "SELECT * FROM `post` ";
// 					connection.query(post_sql, [], function(err, postresult){
// 						if (err) {
// 							responses.sendError(res);
// 						} else {
// 							for(var i=0 ; i<postresult.length ; i++) {
// 								console.log(postresult[i].post_id);
// 								var user_id_post = postresult[i].user_id;
// 								//console.log(user_id_post);
// 								var sql = "SELECT `name` FROM `user1` WHERE `user_id` = ?"	;
// 								connection.query(sql, [user_id_post], function(err, result){
// 									if(err) {
// 										console.log("getting error");
// 										responses.sendError(res);
// 									} else {
// 										  console.log(result);
// 										//responses.success(res,result);
// 									}
// 								})						
// 							}
// 							responses.success(res,postresult);
// 						}
// 					});
// 				}
// 			}
// 		});
// 	} 
// }


exports.get_post_list = function(req, res) {
    var access_token = req.body.access_token;
    var manValue = [access_token];
    var checkBlank = comFunc.checkBlank(manValue);
    let arr = [];
    if (checkBlank == 1) {
        responses.parameterMissing(res);
    } else {
        var user_sql = "SELECT * FROM `user1` WHERE `access_token`=?";
        connection.query(user_sql, [access_token], function(err, userresult) {
            if (err) {
                responses.sendError(res);
            } else {
                if (userresult.length == 0) {
                    responses.invalidAccessToken(res);
                } else {
                    let user_id = userresult[0].user_id;
                    var sql = "SELECT * FROM `post` ORDER BY `rowid` DESC";
                    connection.query(sql, [user_id], function(err, postList) {
                        if (err) {
                            responses.sendError(res);
                        } else {
                            async.eachSeries(postList, processData, function(err) {
                                if (err) {
                                    responses.sendError(res);
                                } else {
                                    responses.success(res, arr);
                                }
                            })

                            function processData(post, callback) {
                                let user_id = post.user_id;
                                var sql = "SELECT `name` FROM `user1` WHERE `user_id` = ?";
                                connection.query(sql, [user_id], function(err, result) {
                                    if (err) {
                                        responses.sendError(res);
                                    } else {
                                        arr.push(_.merge({
                                            name: result[0].name
                                        }, post));
                                        callback();
                                    }
                                });
                            }
                        }
                    });
                }
            }
        });
    }
}

// for like button
exports.like = function(req,res) {
	var post_id  = req.body.post_id;
	console.log(post_id);
	var like_id = md5(new Date());
	var sql = "select * from `post` WHERE `post_id` = ?";
	connection.query(sql,[post_id],function(err,result){
		if(err){
			responses.sendError(res);
		} else {
			console.log(result[0]);
			var user_id = result[0].user_id;
			console.log(user_id);
			var sql = "insert into `like_tbl` (`like_id`,`user_id`,`post_id`,`total_likes`) VALUES (?,?,?,?)";
			var values = [like_id,user_id,post_id,1];
			connection.query(sql,values,function(err,result){
				if (err) {
					responses.sendError(res)
				} else {
					console.log("success");
				}
			})
		}
	})
}