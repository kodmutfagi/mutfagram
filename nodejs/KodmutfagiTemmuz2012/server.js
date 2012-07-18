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
<<<<<<< HEAD
app.post('/upload', function(req, res) {
	console.log('\n Form post data (%s))', JSON.stringify(req.body));
	console.log('\n Form param data (%s))', JSON.stringify(req.params));

	var write = function(fname,fpath, fdata) {

		fs.writeFile(fpath, fdata, function(err) {
			
			feedbackStore.saveImage(fname, fpath,
					function(errf, doc) {

						var feedback = {
							comments : [ {
								comment : req.body.yorum
							} ],
							location : {
								lon : req.body.lon,
								lat : req.body.lat
							},
							photo : doc._id
						};
						feedbackStore.save(feedback, function(errf, feedbacks) {
							if (errf)
								console.log("Failed to save feedback" + errf);
						});

						console.log("GridFS Writing %s %s " + doc._id,
								doc.filename);
					});
			res.redirect("back");
		});
=======

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
>>>>>>> Some fixes and cleanup
	};

	// base
	if (req.body.photo64) {
<<<<<<< HEAD
		//console.log('\nPhoto ', req.body.photo64);
=======
		var buffer = new Buffer(req.body.photo64, "base64");
		var tmpFileName = (new Date()).getTime();
		feedbackStore.saveImageBuffer(tmpFileName, buffer, function(errf, doc) {

			feedbackStore.save(feedback, function(errf, feedbacks) {
				if (errf)
					console.log("Failed to save feedback" + errf);
			});

			console.log("GridFS Buffer Writing %s %s " , doc._id, doc.filename);
		});
		// DEBUG SAVE FILE TO LOCAL DISK
		// var newPath = __dirname + "/tmp/" + (new Date()).getTime();
		// saveTempFile(newPath,buffer, function(e){});
>>>>>>> Some fixes and cleanup

		var buffer = new Buffer(req.body.photo64, "base64");
		var filename = (new Date()).getTime();
		var xp = __dirname + "/uploads2/" + filename;
		fs.writeFileSync(xp, buffer);
		fs.readFile(xp, function(err, data) {
			console.log("READING FILE %s ", err);
			var newPath = __dirname + "/uploads/" + filename;
			//console.log("Writing " + data);
			write(filename ,newPath, data);
		});
	} else {
		// file upload
		console.log('\nuploaded %s (%d Kb) to %s as %s', req.files.foto.name,
				req.files.foto.size / 1024 | 0, req.files.foto.path);

		fs.readFile(req.files.foto.path, function(err, data) {
<<<<<<< HEAD
			console.log("READING FILE %s ", err);
			var newPath = __dirname + "/uploads/" + req.files.foto.name;
			console.log("Writing " + newPath);
			write(req.files.foto.name,newPath, data);
=======
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

>>>>>>> Some fixes and cleanup
		});
	}
	res.redirect("back");

});

<<<<<<< HEAD
=======
var saveTempFile = function(fpath, fdata, callback) {
	console.log("Writing " + newPath);
	fs.writeFile(fpath, fdata, callback);
};

>>>>>>> Some fixes and cleanup
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
<<<<<<< HEAD
		res.contentType("image/jpg");
=======
		res.contentType("image/jpeg");
>>>>>>> Some fixes and cleanup
		res.writeHead(200);
		stream.pipe(res);

	});
});

app.listen(process.env.PORT || 8888);
console.log("Serving at http://localhost:%s/", process.env.PORT || 8888);
