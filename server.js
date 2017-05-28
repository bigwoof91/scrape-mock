// Dependencies
var path = require('path');
var bodyParser = require('body-parser');
// Initialize Express app
var express = require('express');
var app = express();

// Require handlebars
var exphbs = require('express-handlebars');
// Create `ExpressHandlebars` instance with a default layout.
var hbs = exphbs.create({
    defaultLayout: 'main',
    // Specify helpers which are only registered on this instance.
    helpers: {
        addOne: function (value, options) {
            return parseInt(value) + 1;
        }
    }
});
// Set up view engine
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

// Require request and cheerio. This makes the scraping possible
var request = require('request');
var cheerio = require('cheerio');

// Require mongoose and mongodb objectid
var mongoose = require('mongoose');
var ObjectId = require('mongojs').ObjectID;

// Database configuration
mongoose.connect('mongodb://localhost/scraper');
var db = mongoose.connection;

// Show any mongoose errors
db.on('error', function (err) {
    console.log('Database Error:', err);
});

// Require our scrapedData and comment models
var ScrapedData = require('./models/scraped');

// Express middleware
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(express.static('public'));


// ============================================ //
// ================== ROUTES ================== //
// ============================================ //


// Require Customized Cheerio Scraper Module
var scrape = require('./modules/cheerio.js');
app.get('/scrape-recent', scrape.cheerio);

// Main route
app.get('/', function (req, res) {

    ScrapedData
        .findOne()
        .exec(function (err, data) {
            if (err) {
                return console.error(err);
            }
            if (data === null) {
                res.redirect('/scrape-recent');
            }
            else {
                res.render('index', {
                    title: data.title,
                    synopsis: data.synopsis,
                    _id: data._id,
                    articleURL: data.articleURL,
                    comments: data.comments
                });
            }
        });

});

// Find first document in collection
app.get('/first', function(req, res) {
    ScrapedData.find().sort({ _id: 1}).limit(1).exec(function(err, data) {
        if (err) return console.error(err);
        res.json(data);
    })
});

// Retrieve 'next' data from the db
app.get('/next/:id', function (req, res) {
    ScrapedData
        .find({
            _id: { $gt: req.params.id }
        })
        .sort({ _id: 1 })
        .limit(1)
        .exec(function (err, data) {
            if (err) return console.error(err);
            res.json(data);
        });
});

// Retrieve 'prev' data from the db
app.get('/prev/:id', function (req, res) {
    ScrapedData
        .find({
            _id: { $lt: req.params.id }
        })
        .sort({ _id: -1 })
        .limit(1)
        .exec(function (err, data) {
            if (err) return console.error(err);
            res.json(data);
        });
});

// Add comment data to the db
app.post('/comment/:id', function (req, res) {
    // Update scraped data with comment
    ScrapedData.findByIdAndUpdate(
        req.params.id, {
            $push: {
                comments: {
                    text: req.body.comment
                }
            }
        }, { upsert: true, new: true },
        function (err, data) {
            if (err) return console.error(err);
            res.json(data.comments);
        }
    );
});

// Remove comment data from the db
app.post('/remove/:id', function (req, res) {
    // Update scraped data and remove comment
    ScrapedData.findByIdAndUpdate(
        req.params.id, {
            $pull: {
                comments: {
                    _id: req.body.id
                }
            }
        }, { new: true },
        function (err, data) {
            if (err) return console.error(err);
            res.json(data.comments);
        }
    );
});

// Remove comment data from the db
app.delete('/remove/article/:id', function (req, res) {
    // Update scraped data and remove comment
    ScrapedData.remove({ _id: req.params.id },
        function (err, data) {
            if (err) return console.error(err);
            res.render('index', data);
        });
});

// Listen on port 3001
app.listen(3001, function () {
    console.log('App running on port 3001!');
});