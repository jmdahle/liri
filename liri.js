// global varaibles and required node packages
require('dotenv').config();
var moment = require('moment');
var axios = require('axios');
var Spotify = require('node-spotify-api');
var keys = require("./keys.js");
var command = process.argv[2].toLowerCase();
var args = process.argv.slice(3).join(' ');

// first handle the case of do-what-it-says
// this option follows the instruction from random.txt
// or the file provided in the subsequent argument
if (command === 'do-what-it-says') {
    // open a file system object
    var fs = require("fs");
    // if no filename provided as an argument, use random.txt
    args = (args.length === 0) ? 'random.txt' : args;
    // open the file name (args)
    fs.readFile(`./${args}`, 'utf8', (err, data) => {
        if (err) {
            console.log(err);
        } else {
            // split the data into new cmd and extraArgs
            var dataArray = data.split(',');
            var cmd = dataArray[0];
            var extraArgs = dataArray[1].replace('\n', '');
            runCmd(cmd, extraArgs);
        }
    });
} else {
    runCmd(command, args);
}

function runCmd(cmd, extraArgs) {
    switch (cmd) {
        case 'concert-this':
            // everything after the cmd is the artist name
            var artistName = extraArgs;
            // constructor for events returned from API
            function ArtistEvent(name, loc, date) {
                this.venueName = name;
                this.venueLocation = loc;
                this.eventDate = date;
            };
            // create an array to hold ArtistEvents
            var concertEvents = []
            var url = `https://rest.bandsintown.com/artists/${artistName}/events?app_id=c`
            // console.log(url);
            axios.get(url)
                .then((response) => {
                    // console.log(JSON.stringify(response.data, null, 2) );
                    // set a variable equal to the events so we can loop through them
                    var returnedEvents = response.data;
                    // NEED TO HANDLE CASE WHERE "\n{warn=Not found}\n"
                    for (let i = 0; i < returnedEvents.length; i++) {
                        var eName = returnedEvents[i].venue.name;
                        var eLoc = returnedEvents[i].venue.city;
                        // handle case where region is blank
                        if (returnedEvents[i].venue.region === '') {
                            eLoc += ', ' + returnedEvents[i].venue.country;
                        } else {
                            eLoc += ', ' + returnedEvents[i].venue.region;
                            eLoc += ' ' + returnedEvents[i].venue.country;
                        }
                        // use moment to convert date into desired format
                        var eDate = moment(returnedEvents[i].datetime, moment.ISO_8601).format('MM/DD/YYYY');
                        // create event object using constructor
                        var thisEvent = new ArtistEvent(eName, eLoc, eDate);
                        // console.log(eName, eLoc, eDate);
                        // add event to array
                        concertEvents.push(thisEvent);
                    }
                    // output the events
                    console.log(`Upcoming concerts for ${artistName}:`);
                    // headings
                    console.log(
                        textPad('Date', 10, ' '),
                        textPad('Venue', 34, ' '),
                        textPad('Location', 34, ' ')
                    );
                    // headering 'underline'
                    console.log(
                        textPad('', 10, '='),
                        textPad('', 34, '='),
                        textPad('', 34, '=')
                    );
                    // data
                    for (let j = 0; j < concertEvents.length; j++) {
                        console.log(
                            textPad(concertEvents[j].eventDate, 10, ' '),
                            textPad(concertEvents[j].venueName, 34, ' '),
                            textPad(concertEvents[j].venueLocation, 34, ' ')
                        );
                    }
                })
                .catch((error) => {
                    console.log(error);
                });

            break;
        case 'spotify-this-song':
            console.log(`accepted command ${cmd}`);
            // everything after the cmd is the song name
            var songName = extraArgs;
            // use node-spotify-api 
            var spotify = new Spotify(keys.spotify);
            spotify.search({ type: 'track', query: songName, limit: 1 }, (err, data) => {
                if (err) {
                    return console.log('Error occurred: ' + err);
                } else {
                    //   console.log( JSON.stringify(data.tracks.items, null, 2) ); 
                    // get only the first song returned
                    var songInfo = data.tracks.items[0];
                    var artistName = songInfo.artists[0].name;
                    var albumName = songInfo.album.name;
                    var songUrl = songInfo.external_urls.spotify;
                    // output the song information
                    // console.log(songName, artistName, albumName, songUrl);
                    // console.log(`Song: ${songName}\nArtist: ${artistName}\nAlbum: ${albumName}\nSpotify URL: ${songUrl}`);
                    console.log(
                        textPad('Song:', 15, ' '),
                        textPad(songName, 60, ' ')
                    );
                    console.log(
                        textPad('Artist:', 15, ' '),
                        textPad(artistName, 60, ' ')
                    );
                    console.log(
                        textPad('Album:', 15, ' '),
                        textPad(albumName, 60, ' ')
                    );
                    console.log(
                        textPad('Spotify URL:', 15, ' '),
                        textPad(songUrl, 60, ' ')
                    );
                }
            });
            break;
        case 'movie-this':
            console.log(`accepted command ${cmd}`);
            // everything after the cmd is the movie title
            var movieTitle = extraArgs;
            // use axios
            var queryUrl = "http://www.omdbapi.com/?t=" + movieTitle + "&y=&plot=short&apikey=trilogy";
            axios.get(queryUrl)
                .then((response) => {
                    // console.log(JSON.stringify(response.data,null,2));
                    movieData = response.data;
                    var movieYear = movieData.Year;
                    var imdbRating = movieData.imdbRating;
                    //get rotten tomatoes score
                    var rtRating = 'no rating'
                    for (let i = 0; i < movieData.Ratings.length; i++) {
                        if (movieData.Ratings[i].Source === 'Rotten Tomatoes') {
                            rtRating = movieData.Ratings[i].Value;
                        }
                    }
                    var movieCountry = movieData.Country;
                    var moviePlot = movieData.Plot;
                    var movieActors = movieData.Actors;
                    // output movie info
                    // console.log(`${movieTitle}\nYear: ${movieYear}\nCountry: ${movieCountry}\nRatings: IMDB-${imdbRating}, Rotten Tomatoes-${rtRating}\nActors: ${movieActors}\nPlot: ${moviePlot}`);
                    console.log(
                        movieTitle
                    );
                    console.log(
                        moviePlot
                    );
                    console.log(
                        textPad('Actors', 15, ' '),
                        textPad(movieActors, 60, ' ')
                    );
                    console.log(
                        textPad('Year:', 15, ' '),
                        textPad(movieYear, 60, ' ')
                    );
                    console.log(
                        textPad('Country:', 15, ' '),
                        textPad(movieCountry, 60, ' ')
                    );
                    console.log(
                        textPad('Ratings:', 15, ' '),
                        textPad(`IMDB- ${imdbRating}, Rotten Tomatoes- ${rtRating}`, 60, ' ')
                    );
                })
                .catch((error) => {
                    console.log(error);
                });
            break;
        case 'do-what-it-says':
            console.log(`accepted command ${cmd}`);
            break;
        default:
            console.log(`bad command ${cmd}`);
            break;
    }
}

function textPad(string, len, padchar) {
    var emptyString = padchar.repeat(len);
    var newString = string + emptyString;
    newString = newString.substring(0, len);
    return newString;
}