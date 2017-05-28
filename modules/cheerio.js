// Require request and cheerio. This makes the scraping possible
var exports = module.exports = {};
var ScrapedData = require('../models/scraped');

var request = require('request');
var cheerio = require('cheerio');

// Require mongoose and mongodb objectid
var mongoose = require('mongoose');
var ObjectId = require('mongojs').ObjectID;

// // Database configuration
// mongoose.connect('mongodb://localhost/scraper');
// var db = mongoose.connection;

// // Show any mongoose errors
// db.on('error', function (err) {
//     console.log('Database Error:', err);
// });

// Scrape data when app starts

exports.cheerio = function (req, res) {

    var options = {
        url: 'https://www.wsj.com/'
        // headers: {
        //     'User-Agent': 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.13) Gecko/20080311 Firefox/2.0.0.13'
        // }
    };

    request(options, function (error, response, html) {
        // Load the html body from request into cheerio
        var $ = cheerio.load(html);
        // For each element with a "new-content-block" class
        $('div.wsj-card').each(function (i, element) {

            // Save the title text
            var title = $(element).children('h3.wsj-headline').text();
            // Save the article url
            var articleURL = $(element).children().children("a.wsj-headline-link").attr("href");
            // Save the synopsis text
            var synopsis = $(element).children('div.wsj-card-body').children('p.wsj-summary').children('span').text();

            if (synopsis !== "" && title !== "" && articleURL !== "") {
            // Create mongoose model
            var scrapedData = new ScrapedData({
                title: title,
                synopsis: synopsis,
                articleURL: articleURL
            });
            

            // Save data
            scrapedData
                .save(function (err) {
                    if (err) {
                        console.log(err);
                    }
                    console.log('Saved');
                });
            }
            // ScrapedData.findOne()
            //     .exec(function (err, data) {
            //         if (err) return console.error(err);
            //         // If successful render first data
            //         res.render('index', {
            //             title: data.title,
            //             synopsis: data.synopsis,
            //             _id: data._id,
            //             articleURL: data.articleURL,
            //             comments: data.comments
            //         });

            //     });

        });
        res.redirect('/')
    });

};