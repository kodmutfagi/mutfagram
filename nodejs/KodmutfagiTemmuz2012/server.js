var express = require('express');
var fs = require('fs');
var FeedbackStore = require('./feedback.js').FeedbackStore;
Buffer = require('buffer').Buffer;

var app = express.createServer();

app.configure(function() {
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(require('stylus').middleware({
		src : __dirname + '/public'
	}));
	app.use(app.router);
	app.use(express.static(__dirname + '/public'));
});

app.configure('development', function() {
	app.use(express.errorHandler({
		dumpExceptions : true,
		showStack : true
	}));
});

app.configure('production', function() {
	app.use(express.errorHandler());
});

app.get('/', function(req, res) {
	res.render('index.jade', {
		locals : {
			title : 'Hello World',
			people : [ {
				name : "First"
			}, {
				name : "Second"
			} ]
		}
	});
});

var feedbackStore = new FeedbackStore('localhost', 27017);

app.post('/upload', function(req, res, next) {

	// Debug request
	console.log('\nuploaded %s (%d Kb) to %s as %s', req.files.foto.name, req.files.foto.size / 1024 | 0, req.files.foto.path);
	console.log('\n Form data (%s %s %s)', req.body.yorum, req.body.lon, req.body.lat);
	// END debug
	var feedback = {
		comments : [ {
			comment : req.body.yorum
		} ],
		location : {
			lon : req.body.lon,
			lat : req.body.lat
		},
		photo : ""
	};

	// Image Uploaded as base64 encoded data
	if (req.body.photo64) {
		var buffer = new Buffer(req.body.photo64, "base64");
		var tmpFileName = (new Date()).getTime();
		feedbackStore.saveImageBuffer(tmpFileName, buffer, function(errf, doc) {
			feedback.photo = doc._id;
			feedbackStore.save(feedback, function(errf, feedbacks) {
				if (errf)
					console.log("Failed to save feedback" + errf);
			});

			console.log("GridFS Buffer Writing %s %s " , doc._id, doc.filename);
		});
		// DEBUG SAVE FILE TO LOCAL DISK
		// var newPath = __dirname + "/tmp/" + (new Date()).getTime();
		// saveTempFile(newPath,buffer, function(e){});

	} else {
		// Image File Uploaded as a multi-part form
		fs.readFile(req.files.foto.path, function(err, data) {
			feedbackStore.saveImage(req.files.foto.name, req.files.foto.path, function(errf, doc) {
				feedback.photo = doc._id;
				feedbackStore.save(feedback, function(errf, feedbacks) {
					if (errf)
						console.log("Failed to save feedback" + errf);

					console.log("Feedback/GridFS saved  %s %s" , doc._id, doc.filename);

				});
			});

			// DEBUG SAVE FILE TO LOCAL DISK
			// var newPath = __dirname + "/tmp/" + req.files.foto.name;
			// saveTempFile(newPath,data, function(e){});

		});
	}
	res.redirect("back");

});

var saveTempFile = function(fpath, fdata, callback) {
	console.log("Writing " + newPath);
	fs.writeFile(fpath, fdata, callback);
};

app.get('/feedbacks', function(req, res) {

	feedbackStore.findAll(function(errf, feedbacks) {
		if (errf) {
			console.log("Failed to save feedback" + errf);
			res.send(JSON.stringify({
				meta : {
					errorCode : 1,
					errorMessage : errf
				}
			}));
		}
		res.send(JSON.stringify({
			meta : {
				errorCode : 0
			},
			response : feedbacks
		}));
	});

});

app.get('/images/:id', function(req, res) {
	var id = req.params.id;
	feedbackStore.readImage(id, function(err, stream) {
		res.contentType("image/jpeg");
		res.writeHead(200);
		stream.pipe(res);

	});
});

app.listen(process.env.PORT || 8888);
console.log("Serving at http://localhost:%s/", process.env.PORT || 8888);