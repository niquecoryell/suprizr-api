
var User = require("../models/user"),
	Auth = require("../models/auth");

function UserController() {

	this.getUser = function(req, res, next) {
		Auth.getCurrentUser(req, function(err, user){
			if (err || !user) {
				res.send(401, { error : "Access denied" });
			} else {
				res.json(user);
			}
		});
	}

	this.getById = function(req, res, next) {
		Auth.getCurrentUser(req, function(){
			if (err || !user) {
				res.send(401, { error : "Access denied" });
			} else {
				var id = req.param.id;
				User.findById(id, function(err, user){
					if (err || !user) {
						res.send(404, { error : "Could not find user with id "+id });
					} else {
						res.json(user);
					}
				});
			}
		})
	};

	this.putData = function(req, res, next) {
		Auth.getCurrentUser(req, function(err, user){
			if (err || !user) {
				res.send(401, { error : "Access denied" });
			} else {
				var id = user._id;
				var body = req.body;
				User.putData(id, body, function(err, user){
					if (err || !user) {
						res.send(404, { error : err || "Could not find user with id "+id });
					} else {
						res.json(user);
					}
				}, User.allowed_keys);
			}
		});
	}
}

module.exports = function(app) {
	
	var controller = new UserController();

	app.get("/user", controller.getUser); // gets the current user via auth_token
	app.get("/user/:id", controller.getById); // gets a user by id
	app.put("/user", controller.putData); // changes data for the current user

	return controller;
}