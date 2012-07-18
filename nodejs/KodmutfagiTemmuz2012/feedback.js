// This code is adapted from http://howtonode.org/express-mongodb 
// for kodmutfagi.org nodejs+ mongo workshop
// we thank the author Ciaran Jessup for his work

var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var GridStore = require('mongodb').GridStore;
var ObjectID = require('mongodb').ObjectID;

FeedbackStore = function(host, port) {
	this.db = new Db('kodmutfagi-feedback', new Server(host, port, {
		auto_reconnect : true
	}, {}));
	this.db.open(function() {
	});

};

FeedbackStore.prototype.getCollection = function(callback) {
	this.db.collection('feedbacks', function(error, feedback_collection) {
		if (error)
			callback(error);
		else
			callback(null, feedback_collection);
	});
};

FeedbackStore.prototype.findAll = function(callback) {
	this.getCollection(function(error, feedback_collection) {
		if (error)
			callback(error)
		else {
			feedback_collection.find().toArray(function(error, results) {
				if (error)
					callback(error)
				else
					callback(null, results)
			});
		}
	});
};

FeedbackStore.prototype.findById = function(id, callback) {
	this.getCollection(function(error, feedback_collection) {
		if (error)
			callback(error)
		else {
			feedback_collection.findOne({
				_id : feedback_collection.db.bson_serializer.ObjectID.createFromHexString(id)
			}, function(error, result) {
				if (error)
					callback(error)
				else
					callback(null, result)
			});
		}
	});
};

FeedbackStore.prototype.save = function(feedbacks, callback) {
	this.getCollection(function(error, feedback_collection) {
		if (error)
			callback(error);
		else {
			if (typeof (feedbacks.length) == "undefined")
				feedbacks = [ feedbacks ];

			for ( var i = 0; i < feedbacks.length; i++) {
				feedback = feedbacks[i];
				feedback.created_at = new Date();
				if (feedback.comments === undefined)
					feedbacks.comments = [];
				for ( var j = 0; j < feedback.comments.length; j++) {
					if (feedback.comments[j].created_at === undefined)
						feedback.comments[j].created_at = new Date();
				}
			}

			feedback_collection.insert(feedbacks, function() {
				callback(null, feedbacks);
			});
		}
	});
};

FeedbackStore.prototype.saveImage = function(filename, filepath, callback) {

	var gridStoreWrite = new GridStore(this.db, new ObjectID(), filename, "w", {
		"chunk_size" : 1024 * 4
	});
	gridStoreWrite.writeFile(filepath, callback);

};

FeedbackStore.prototype.readImage = function(id, callback) {
	var gridStoreRead = new GridStore(this.db, new ObjectID(id), "r");
	gridStoreRead.open(function(err, gridStoreRead) {
		console.log("gridstoreread error" + err);
		var stream = gridStoreRead.stream(true);
		callback(null, stream);
	});

};

FeedbackStore.prototype.saveImageBuffer = function(filename, buffer, callback) {

	var gridStoreWrite = new GridStore(this.db, new ObjectID(), "w", {
		"chunk_size" : 1024 * 4
	});
	gridStoreWrite.open(function(err, gs) {
		gs.write(buffer, true,function(e, data) {
			gridStoreWrite.close(function(ec, cdata) {});
			callback(e, data);
		});
	});

};

exports.FeedbackStore = FeedbackStore;