var express = require('express');
var fs = require('fs');
var FeedbackStore = require('./feedback.js').FeedbackStore;

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
	console.log('\nuploaded %s (%d Kb) to %s as %s', req.files.foto.name, req.files.foto.size / 1024 | 0, req.files.foto.path);
	console.log('\n Form data (%s %s %s)', req.body.yorum, req.body.lon, req.body.lat);

	fs.readFile(req.files.foto.path, function(err, data) {
		console.log("READING FILE %s ", err);
		var newPath = __dirname + "/uploads/" + req.files.foto.name;
		console.log("Writing " + newPath);
		fs.writeFile(newPath, data, function(err) {
			console.log("Error Writing " + err);
			feedbackStore.saveImage(req.files.foto.name, req.files.foto.path, function(errf, doc) {

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

				console.log("GridFS Writing %s %s " + doc._id, doc.filename);
			});
			res.redirect("back");
		});
	});
});

app.get('/feedbacks', function(req, res) {

	feedbackStore.findAll(function(errf, feedbacks) {
		if (errf){
			console.log("Failed to save feedback" + errf);
			res.send(JSON.stringify({meta: {errorCode: 1, errorMessage: errf}}));
		}
		res.send(JSON.stringify({ meta: {errorCode: 0}, response: feedbacks }));
	});

});

app.listen(process.env.PORT || 8080);
console.log("Serving at http://localhost:%s/", process.env.PORT || 8080);