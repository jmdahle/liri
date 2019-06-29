# LIRI

## About LIRI
LIRI is a **L**anguage **I**nterpretation and **R**ecognition **I**nterface. LIRI is a command line node.js application that accepts a command and command argument and returns the requested information.  LIRI searches the Spotify API for songs, the Bands in Town API for concerts, and OMDB API for movies.  LIRI returns information to the console (terminal) formatted for an 80 character screen and to a log file as text (log.txt).  LIRI can also process pre-defined commands from a text file.

## Installation
LIRI relies on node.js and the following packages that can be installed using the node package manager (npm).

* [Node-Spotify-API](https://www.npmjs.com/package/node-spotify-api)
* [Axios](https://www.npmjs.com/package/axios)
* [Moment](https://www.npmjs.com/package/moment)
* [DotEnv](https://www.npmjs.com/package/dotenv)

Keys are needed for the following APIs:
* [OMDB API](http://www.omdbapi.com)
* [Bands In Town API](http://www.artists.bandsintown.com/bandsintown-api)
* [Spotify](https://developer.spotify.com/)

Your Spotify keys are stored in ```.env```:

```javascript
# Spotify API Keys

SPOTIFY_ID=YOUR-ID-HERE
SPOTIFY_SECRET=YOUR-SECRET-KEY-HERE
```

## Usage
LIRI can be used to process a few basic commands or run one or more commands from a text file.

### Basic Commands
LIRI can process a few basic commands.  The format and usage for those commands:

```bash
node liri.js concert-this This Artist Name # returns upcoming concerts for 'This Artist Name'
node liri.js movie-this This Movie Title # returns movie details for 'This Movie Title'
node liri.js spotify-this-song This Song Title # returns details of individual artist performances of 'This Song Title'
```
### Commands from File
LIRI can also process these basic commands from a text file, using the following syntax:

```bash
node liri.js do-what-it-says command_file.txt # processes the commands in command_file.txt
```

The command file must list a command and it's arguments separated by a comma separate commands on each line.  See ```random.txt``` or ```test-cmd.txt``` as examples.

### Output to log.txt
LIRI outputs results to the terminal console and logs the results to ```log.txt``` by default.  To change the output configuration, you may change the global varaibles ```flagToLog``` or ```flagToConsole```.  They are both set to ```true``` by default.

## Technical Notes
* Output is formatted to be readible on an 80 character wide terminal console.
* Output is also logged to log.txt.  This file is appended each time a new command is run.
* The command argument can be encased in quotes as a single argument (e.g., 'Born to Run') or entered without quotes and accepted as multiple arguments (e.g., Born to Run).
* Output is formatted using a "padding" function that formats output to a specified length, using a specified character (e.g., a space ' ' or equal sign '=') to "pad" the text to the proper length.
* Long text output (e.g., movie plot description) is formatted to "wrap" onto multiple lines using a text wraping function.  The function adds a newline at a space following the specified length.
* All code is original and written for a class project by John Dahle, completed 7/3/2019.

## Resouces
* Code for liri.js is found at [GitHub](https://github.com/jmdahle/liri)




