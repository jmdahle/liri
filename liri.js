// global varaibles and required node packages
require('dotenv').config();                     // keeps spotify keys secret
var moment = require('moment');                 // used for formatting dates
var axios = require('axios');                   // used for API calls
var Spotify = require('node-spotify-api');      // Spotify API calls
var keys = require("./keys.js");                // exports the spotify keys
var command = process.argv[2].toLowerCase();    // the user-provided command
var args = process.argv.slice(3).join(' ');     // the [optional] arguments for the command
var flagToLog = true;                           // flag for logging to log.txt
var flagToConsole = true;                       // flag for printing to console

/**
* first handle the case of do-what-it-says which uses from random.txt (default)
* or the file provided in args (see global vars above)
* to provide the command(s)
*/
if (command === 'do-what-it-says') {
    args = (args.length === 0) ? 'random.txt' : args;  // if no filename provided as an argument, use random.txt
    var fs = require("fs");  // open a file system object
    fs.readFile(`./${args}`, 'utf8', (err, data) => {  // open the file name (args)
        if (err) {
            console.log(err);
        } else {
            var commandArray = data.split('\n'); // first split the data into individal commands (one per newline \n)
            for (let c = 0; c < commandArray.length; c++) {
                var dataArray = commandArray[c].split(',');  // split the data into new cmd and extraArgs
                if (dataArray.length === 2) {
                    var cmd = dataArray[0].trim();
                    var extraArgs = dataArray[1].trim();
                    runCmd(cmd, extraArgs);
                } else {
                    console.log(`bad command ${dataArray[0]}`);
                }
            }
        }
    });
} else {
    runCmd(command, args);  // the user provided a direct command (not do-what-it-says)
}

function runCmd(cmd, extraArgs) {
    switch (cmd) {
        case 'concert-this':
            var artistName = (extraArgs.length === 0) ? 'The Black Dahlia Murder': extraArgs;  // use a default if no args provided
            function ArtistEvent(name, loc, date) {  // constructor for events returned from API
                this.venueName = name;
                this.venueLocation = loc;
                this.eventDate = date;
            };
            var concertEvents = [];  // create an array to hold ArtistEvents
            var url = `https://rest.bandsintown.com/artists/${artistName}/events?app_id=c`
            axios.get(url)
                .then((response) => {
                    var returnedEvents = response.data;  // set a variable equal to the events so we can loop through them
// NEED TO HANDLE CASE WHERE "\n{warn=Not found}\n"
                    for (let i = 0; i < returnedEvents.length; i++) {
                        var eName = returnedEvents[i].venue.name;
                        var eLoc = returnedEvents[i].venue.city;
                        if (returnedEvents[i].venue.region === '') {  // handle case where region is blank
                            eLoc += ', ' + returnedEvents[i].venue.country;
                        } else {
                            eLoc += ', ' + returnedEvents[i].venue.region;
                            eLoc += ' ' + returnedEvents[i].venue.country;
                        }
                        var eDate = moment(returnedEvents[i].datetime, moment.ISO_8601).format('MM/DD/YYYY');  // use moment to convert date into desired format
                        var thisEvent = new ArtistEvent(eName, eLoc, eDate);  // create event object using constructor
                        concertEvents.push(thisEvent);  // add event to array
                    }
                    outputConcerts(artistName, concertEvents);
                })
                .catch((error) => {
                    console.log(error);
                });

            break;
        case 'spotify-this-song':
            var songName = (extraArgs.length === 0) ? 'The Sign' : extraArgs;  // use default if empty
            function SongEntry(name, album, url) {  // constructor for multiple songs returned from API
                this.artistName = name;
                this.albumName = album;
                this.songUrl = url;
            };
            var songPerformances = [];  // create an array to hold ArtistEvents
            var spotify = new Spotify(keys.spotify);  // use node-spotify-api 
            spotify.search({ type: 'track', query: songName, limit: 20 }, (err, data) => {
                if (err) {
                    return console.log('Error occurred: ' + err);
                } else {
                    var songInfo = data.tracks.items;  // get the song array returned
                    for (let s = 0; s < data.tracks.items.length; s++) {
                        var aName = songInfo[s].artists[0].name;
                        var aAlbum = songInfo[s].album.name;
                        var aUrl = songInfo[s].external_urls.spotify;
                        var thisSong = new SongEntry(aName, aAlbum, aUrl);  // create event object using constructor
                        songPerformances.push(thisSong); // add event to array
                    }
                    outputSongs (songName, songPerformances);
                }
            });
            break;
        case 'movie-this':
            var movieTitle = (extraArgs.length === 0) ? 'Mr. Nobody' : extraArgs; // use Mr. Nobody as default if no args provided
            function MovieInfo (title, plot, year, imdb, rottenTomoatoes, country, actors) {  // constructor for movie info
                this.movieName = title;
                this.moviePlot = plot;
                this.movieYear = year;
                this.movieImdbRating = imdb;
                this.movieRtRating = rottenTomoatoes;
                this.movieCountry = country;
                this.movieActors = actors;
            };
            var queryUrl = "http://www.omdbapi.com/?t=" + movieTitle + "&y=&plot=short&apikey=trilogy";  // use axios
            axios.get(queryUrl)
                .then((response) => {
                    movieData = response.data;
                    var moviePlot = movieData.Plot;
                    var movieYear = movieData.Year;
                    var imdbRating = movieData.imdbRating;
                    var rtRating = 'no rating';  //get rotten tomatoes score
                    for (let i = 0; i < movieData.Ratings.length; i++) {
                        if (movieData.Ratings[i].Source === 'Rotten Tomatoes') {
                            rtRating = movieData.Ratings[i].Value;
                        }
                    }
                    var movieCountry = movieData.Country;
                    var movieActors = movieData.Actors;
                    var thisMovie = new MovieInfo(
                        movieTitle, moviePlot, movieYear, imdbRating, rtRating, movieCountry, movieActors
                        );
                    outputMovie(movieTitle, thisMovie);                  
                })
                .catch((error) => {
                    console.log(error);
                });
            break;
        default:
            console.log(`bad command ${cmd}`);
            break;
    }
}

function outputConcerts(artistName, concertArray) {
    var logText = ""; // used to get entire text to send to logfile log.txt
    var msg = ""; // used to create lines of text to output
    msg = `Upcoming concerts for ${artistName}:`;  // output title
    logText += msg + '\n';
    msg = textPad('Date', 10, ' ');  // create headings
    msg += ' ';
    msg += textPad('Venue', 34, ' ');
    msg += ' ';
    msg += textPad('Location', 34, ' ');
    msg += '\n'
    msg += textPad('', 10, '=');  // create heading underline
    msg += ' ';
    msg += textPad('', 34, '=');
    msg += ' ';
    msg += textPad('', 34, '=');
    logText += msg + '\n';  // output the headings
    for (let j = 0; j < concertArray.length; j++) {    // data        
        msg = textPad(concertArray[j].eventDate, 10, ' ');  // create the event text
        msg += ' ';
        msg += textPad(concertArray[j].venueName, 34, ' ');
        msg += ' ';
        msg += textPad(concertArray[j].venueLocation, 34, ' ');
        msg += ' ';
        logText += msg + '\n';
    }
    printIt(logText);  // output the event
}

function outputSongs (songName, songArray) {
    var logText = ""; // used to get entire text to send to logfile log.txt
    var msg = ""; // used to create lines of text to outpuT
    msg = `Performances of the song '${songName}':`;  // output title
    logText += msg + '\n';
    msg = textPad('Artist', 25, ' ');  // create headings
    msg += ' ';
    msg += textPad('Album', 50, ' ');
    msg += '\n';
    msg += textPad('', 25, '='); // create heading underline
    msg += ' ';
    msg += textPad('', 50, '=');
    msg += '\n';
    msg += textPad('URL', 76, ' ');  // create second heading line
    msg += '\n';
    msg += textPad('', 76, '=');
    msg += '\n';
    logText += msg + '\n';  // output the headings
    for (let q = 0; q < songArray.length; q++) {  // data
        msg = textPad(songArray[q].artistName, 25, ' ');
        msg += ' ';
        msg += textPad(songArray[q].albumName, 50, ' ');
        msg += '\n';
        msg += textPad(songArray[q].songUrl, 76, ' ');
        msg += '\n';
        msg += textPad('', 76, '-');
        logText += msg + '\n'
    }
    printIt(logText);  // output the song performances
}

function outputMovie (movieName, movieInfo) {
    var logText = ""; // used to get entire text to send to logfile log.txt
    var msg = ""; // used to create lines of text to output
    msg = `Detailed information for ${movieName}`;  // output title
    msg += '\n';
    msg += textPad('', 25, '-');
    msg += '\n';
    logText += msg;
    msg = wrapLongText(movieInfo.moviePlot, 60);  // data
    logText += msg + '\n';
    msg = textPad('Actors', 15, ' ');
    msg += textPad(movieInfo.movieActors, 60, ' ');
    msg += '\n';
    msg += textPad('Year:', 15, ' ');
    msg += textPad(movieInfo.movieYear, 60, ' ');
    msg += '\n';
    msg += textPad('Country:', 15, ' ');
    msg += textPad(movieInfo.movieCountry, 60, ' ');
    msg += '\n';
    msg += textPad('Ratings:', 15, ' ');
    msg += textPad(`IMDB- ${movieInfo.imdbRating}, Rotten Tomatoes- ${movieInfo.rtRating}`, 60, ' ');
    msg += '\n';
    logText += msg;
    printIt(logText);  // output movie
}

function printIt (text) {
    var separator = textPad('',5, ' ') + textPad('',70,'_') + '\n'
    text += separator;  // add an separator to end of text  --- so it's easier to see in log.txt
    if (flagToLog) {  // if logging, output to log.txt
        var fs = require("fs");  // use fs to append to log.txt
        fs.appendFile("log.txt", text, (err) => {
            if (err) {
                console.log(err);
            }
        });
    }
    if (flagToConsole) { // if printing to console
        console.log(text);
    }
}

function textPad(string, len, padchar) {
    var emptyString = padchar.repeat(len);
    var newString = string + emptyString;
    newString = newString.substring(0, len);
    return newString;
}

function wrapLongText (longText, wrapAt) {
    var wrapText = '';
    var position = 0;
    while (position < longText.length) {
        nextPosition = longText.indexOf(' ',position + wrapAt);
        if (nextPosition < 0) nextPosition = longText.length;
        wrapText += longText.substring(position, nextPosition) + '\n';
        position = nextPosition + 1;
    }
    return wrapText;
}