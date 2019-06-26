// global varaibles and required node packages
require('dotenv').config();
var moment = require('moment');
var axios = require('axios');
var Spotify = require('node-spotify-api');
var keys = require("./keys.js");
var cmd = process.argv[2].toLowerCase();

switch (cmd) {
    case 'concert-this':
        console.log(`accepted command ${cmd}`);
        // everything after the cmd is the artist name
        var artistName = process.argv.slice(3).join(' ');
        // constructor for events returned from API
        function ArtistEvent (name, loc, date) {
            this.venueName = name;
            this.venueLocation = loc;
            this.eventDate = date;
        };
        // create an array to hold ArtistEvents
        var concertEvents = []
        var url = `https://rest.bandsintown.com/artists/${artistName}/events?app_id=c`
        // console.log(url);
        axios.get(url)
            .then( (response) => {
                // console.log(JSON.stringify(response.data, null, 2) );
                // set a variable equal to the events so we can loop through them
                var returnedEvents = response.data;
                // NEED TO HANDLE CASE WHERE "\n{warn=Not found}\n"
                // NEED TO ADJUST DATE INTO FORMAT MM/DD/YYYY
                for (let i = 0; i < returnedEvents.length; i++) {
                    var eName = returnedEvents[i].venue.name;
                    var eLoc = returnedEvents[i].venue.city;
                    eLoc += ', ' + returnedEvents[i].venue.region;
                    eLoc += ' ' + returnedEvents[i].venue.country;
                    var eDate = returnedEvents[i].datetime;
                    var thisEvent = new ArtistEvent (eName, eLoc, eDate);
                    // console.log(eName, eLoc, eDate);
                    concertEvents.push(thisEvent);
                }
                // output the events
                console.log(`Upcoming concerts for ${artistName}:`);
                console.log (
                    textPad('Date',20,' '),
                    textPad('Venue',40,' '),
                    textPad('Location',40,' ')
                );
                console.log (
                    textPad('',20,'='),
                    textPad('',40,'='),
                    textPad('',40,'=')
                );
                for (let j = 0; j < concertEvents.length; j++) {
                    console.log(
                        textPad(concertEvents[j].eventDate,20,' '), 
                        textPad(concertEvents[j].venueName,40,' '), 
                        textPad(concertEvents[j].venueLocation,40,' ')
                        );
                }
            })
            .catch( (error) => {
                console.log(error);
            });
            
        break;
    case 'spotify-this-song':
            console.log(`accepted command ${cmd}`);
            // everything after the cmd is the song name
            var songName = process.argv.slice(3).join(' ');
            // use node-spotify-api 
            var spotify = new Spotify(keys.spotify);
            spotify.search({ type: 'track', query: songName, limit: 1 }, (err, data) => {
                if (err) {
                  return console.log('Error occurred: ' + err);
                }
            //   console.log( JSON.stringify(data.tracks.items, null, 2) ); 
              var songInfo = data.tracks.items[0];
              var artistName = songInfo.artists[0].name;
              var albumName = songInfo.album.name;
              var songUrl = songInfo.external_urls.spotify;
              console.log(songName, artistName, albumName, songUrl);
              });
            break;
    case 'movie-this':
            console.log(`accepted command ${cmd}`);
            // everything after the cmd is the movie title
            var movieTitle = process.argv.slice(3).join(' ');
            // use axios
            var queryUrl = "http://www.omdbapi.com/?t=" + movieTitle + "&y=&plot=short&apikey=trilogy";
            axios.get(queryUrl)
              .then( (response) => {
                console.log(JSON.stringify(response.data,null,2));
                movieData = response.data;
                var movieYear = movieData.Year;
                var imdbRating = movieData.imdbRating;
                //get rotten tomatoes score
                var rtRating = 'no rating'
                for (let i = 0; i < movieData.Ratings.length; i++) {
                    if (movieData.Ratings.Source === 'Rotten Tomatoes') {
                        rtRating = movieData.Ratings.Value;
                    }
                }
              })
              .catch( (error) => {
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

function textPad (string, len, padchar) {
    var emptyString = padchar.repeat(len);
    var newString = string + emptyString;
    newString = newString.substring(0,len-1);
    return newString;
}