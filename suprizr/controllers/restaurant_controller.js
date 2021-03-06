
var Restaurant = require("../models/restaurant"),
	      Auth = require("../models/auth"),
	      Meal = require("../models/meal"),
	     Error = require("./error_controller");

function RestaurantController() {

	this.getRestaurants = function(req, res, next) {
		Auth.getCurrentUser(req, function(err, user){
			if (err || !user) {
				return Error.e401(res, err);
			} else {
				Restaurant.findAll({}, function(err, docs){
					if (err || !docs) return Error.e400(res, err);
					return res.json({
						"restaurants" : docs
					});
				});
			}
		});
	}

	this.createRestaurant = function(req, res, next) {
		Auth.getAdminUser(req, function(err, user){
			if (err || !user) {
				return Error.e401(res, err);
			} else {
				Restaurant.create(req.body, function(err, doc){
					if (err || !doc) {
						return Error.e400(res, err);
					} else {
						return res.json(doc);
					}
				});
			}
		});
	};

	this.getById = function(req, res, next) {
		Auth.getCurrentUser(req, function(err, user){
			if (err || !user) {
				res.send(401, { error : "Access denied" });
			} else {
				var id = req.params.id;
				Restaurant.findById(id, function(err, doc){
					if (err || !doc) {
						return Error.e404(res, err, "Could not find restaurant with id "+id);
					} else {
						return res.json(doc);
					}
				});
			}
		});
	};

	this.putData = function(req, res, next) {
		var id = req.params.id;
		Auth.getCurrentUser(req, function(err, user){
			if (err || !user || (user.restaurant != id && !user.admin)) {
				return Error.e401(res, err);
			} else {
				Restaurant.putData(id, req.body, function(err, rest){
					if (err || !rest) {
						return Error.e400(res, err);
					} else {
						return res.json(rest);
					}
				});
			}
		}, "+restaurant");
	}

	this.removeRestaurant = function(req, res, next) {
		var id = req.params.id;
		Auth.getAdminUser(req, function(err, admin){
			if (err || !admin) {
				return Error.e401(res, err);
			} else {
				Restaurant.delete(id, function(err, doc){
					if (err || !doc) {
						return Error.e400(res, err);
					} else {
						Meal.update({"restaurant":doc._id}, {deleted:true}, {multi:true}).exec();
						return res.json(doc);
					}
				});
			}
		});
	}
}

module.exports = function(app) {
	
	var controller = new RestaurantController();

	app.get("/restaurant", controller.getRestaurants);
	app.get("/restaurant/:id", controller.getById);
	app.post("/restaurant", controller.createRestaurant);
	app.put("/restaurant/:id", controller.putData);
	app.delete("/restaurant/:id", controller.removeRestaurant);

	return controller;
}