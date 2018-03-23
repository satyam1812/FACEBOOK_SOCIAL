var md5 = require('md5');
var connection = require('../modules/connection');
var responses = require('../modules/responses');
var comFunc = require('../modules/commonFunction');
var async = require ('async');
var _ =require('lodash');
//================================================//
//==========API for LOGIN=========================//
//================================================//
var arr = [];
exports.login = function(req,res) {
	var { email, password } = req.body;

	var manValue = [email, password];
	var checkBlank = comFunc.checkBlank(manValue);

	if( checkBlank == 1 ) {
		responses.parameterMissing(res);
	} else {

		var password = md5(password);
		var user_sql = "SELECT * FROM `user1` WHERE `email`=? AND `password`=?";
		connection.query(user_sql, [email, password], function(err, userResult){
			if ( err ) {
				responses.sendError(res);
			} else if ( userResult.length > 0 ) {
				var access_token =  md5(new Date());
				var sql = "UPDATE `user1` SET `access_token`=? WHERE `email`=?";
				connection.query(sql, [access_token, email], function(err) {
					if( err ) {
						responses.sendError(res);
					} else {
						userResult[0].password = "";
						//console.log(userResult);
						userResult[0].access_token = access_token;
						responses.success(res, userResult[0]);
					}
				});
			} else {
					responses.INVALID_CREDENTIAL(res);
			}
		});
	}
}
//=================================================//
//================For signup=======================//
//=================================================//
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
					connection.query(insert_sql, values, function(err){
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
//================================================================//
//=========================for post status========================//
//================================================================//
exports.post = function(req,res){
	var poststatus = req.body.post;
	var access_token = req.body.access_token;
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

				var sql = "INSERT INTO `post` (`post_id`,`user_id`,`post_data`,`uploaded_on`,`post_type`) VALUES (?,?,?,?,?)";
				values = [post_id,user_id,poststatus,uploaded_on,1];
				connection.query(sql,values,function(err,result){
					if(err) {
						responses.sendError(res);
					} else {
						var sql = "SELECT * FROM `post` WHERE `post_id`=?";
						connection.query(sql, [post_id], function(err, postList){
							if ( err ) {
								responses.sendError(res);
							} else {
	                            async.eachSeries(postList, processData, function(err) {
	                                if (err) {
	                                    responses.sendError(res);
	                                } else {
	                                    responses.success(res, arr);
	                                }
	                            });

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
				});
			}
		});
	}
}
//=========================================================================//
//===============GAT POST ON LOAD==========================================//
//=========================================================================//
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

//====================================================================//
//======================like a post===================================//
//====================================================================//
exports.like = function(req,res) {

	var access_token = req.body.access_token;
	var post_id = req.body.post_id;
	var like_id = md5(new Date());
	var date=(new Date());
	console.log(post_id,access_token,like_id);
	var sql = "select `user_id` from  `user1` WHERE `access_token` = ?"
	connection.query(sql,[access_token],function(err,result){
		if(err) {
			responses.sendError(res);
			console.log(err);
		} else {
			var user_id = result[0].user_id;
			var sql = "select * FROM `like_tbl` where `user_id` = ? and `post_id` = ?";
			var values = [user_id,post_id];
			connection.query(sql,values,function(err,result){

				if(err) {
					responses.sendError(res);
					console.log(err);
				} else if (result.length>0) {
					console.log(result[0].user_id);
					var sql ="delete FROM `like_tbl` where `user_id` = ? AND `post_id` =?";
					var values = [user_id,post_id];
					connection.query(sql,values,function(err,result){
						if(err) {
							responses.sendError(res);
							console.log(err);
						} else {
							var sql = "select * from `like_tbl` where `user_id`= ? AND `post_id`=?";
							connection.query(sql,[user_id,post_id],function(err,result){
								if(err){
									responses.sendError(res);
									console.log(err);
								}else{
									responses.success(res,result);
								}
							});
						}
					});
				} else {
					var sql = "insert into `like_tbl` (`user_id`,`post_id`,`like_id`,`liked_on`) values (?,?,?,?)"
					var values = [user_id,post_id,like_id,date];
					connection.query(sql,values,function(err,result){
						if(err) {
							console.log(err);
							responses.sendError(res);
						} else {
							var sql = "select * from `like_tbl` where `user_id`= ? AND `post_id`=?";
							connection.query(sql,[user_id,post_id],function(err,result){
								if(err){
									console.log(err);
									responses.sendError(res);
									
								}else{
									responses.success(res,result);
								}
							});
						}
					});
				}
			});
		}
	});
}
//======================================================================//
//===============comment on post========================================//
//======================================================================//
exports.post_comment = function(req,res) {
	console.log("API  ME ERROR HAI");

	var access_token = req.body.access_token;
	var post_id = req.body.post_id;
	
	var comment_content = req.body.comment_content;
	var comment_id = md5(new Date());
	var date=(new Date());
	console.log("API  ME ERROR HAI");
	console.log(post_id,access_token,comment_id);
	var sql = "select `user_id` from  `user1` WHERE `access_token` = ?"
	connection.query(sql,[access_token],function(err,result){
		if(err) {
			console.log(err);
			responses.sendError(res);
			
		} else {
			var user_id = result[0].user_id;
			insert_sql = "INSERT INTO `comment_table`(`comment_id`,`post_id`,`commented_by`,`coment_content`,commented_on) VALUES(?,?,?,?,?)";
			VALUES = [comment_id,post_id,user_id,comment_content,date];
			connection.query(insert_sql,VALUES,function(err){
				if(err){
					console.log(err);
					responses.sendError(res);
				} else {
					selectsql= "SELECT * from `comment_table` where `post_id`=?";
					connection.query(selectsql,[post_id],function(err,result){
						if(err){
							console.log(err);
							responses.sendError(res);
						} else {
							responses.success(res,result);
						}
					});
				}
			});
		}
	});
}