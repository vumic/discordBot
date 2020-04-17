const axios = require('axios');
const Discord = require('discord.js');
//const auth = require('./auth.json');
const genres = require('./src/genres.json');
const client = new Discord.Client();
const prefix = '!';
let url = "https://api.themoviedb.org/3/";

client.once('ready', () => {
    console.log('Your discord bot is ready!');
});

client.on('message', async message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();
    //Lists all genres possible.
    if (command === "help") {
        let gen = '';
        for (var i = 0; i < genres.length; i++) {
            gen += `\n${genres[i].name} `;
        }
        message.channel.send(`Commands: !movie [genre] or !movie_p [genre] for top 100 movies.\nSeparate genres with a space.\nGenres include... ${gen}`);
    }
    //gets random movie, !movie genre genre ... !movie_p will give top 100 movies if possible.
    else if (command === "movie" || command === "movie_p") {
        let name = "";
        let str = "";
        let pages = 1;
        let randomNum = 1;
        let movieID;
        let max = 50;
        //if you want only popular movies, it will limit it to 5 instead of 50. This gives you top 100 films popular desc.
        if (command === "movie_p") max = 5;
        //checks if you actually have genre arguments
        if (args.length) {
            //adds extra genres
            for (let j = 1; j < args.length; j++) {
                let gid = getGenreID(args[j]);
                if (gid > 0) {
                    str += "," + gid;
                }
            }
            //gets base genre (first) assuming its not random (no string needed for no genre.)
            if (args[0] !== "random") {
                let genreID = getGenreID(args[0]);
                if (genreID > 0) {
                    name = "&with_genres=" + genreID + str;
                }
            }
        }

        //gets max pages 
        await axios.get(url + 'discover/movie' + process.env.API_KEY + '&language=en-US &sort_by=popularity.desc&include_adult=false&include_video=false&page=' + pages + name + '&with_original_language=en')
            .then((response) => {
                let arr = response.data;
                pages = arr.total_pages;
            });

        //if page is 1 or less dont get data.
        if (pages <= 1)
            message.channel.send(`No valid movies`)
        else {
            //gets a random number in the constraints of the pages. (50 pages if possible.)
            (pages >= max) ? randomNum = Math.floor(Math.random() * max) + 1 : randomNum = Math.floor(Math.random() * pages) + 1;

            //finds the random movie (but in top 50 pages so its not obscure (each page has 20 movies)).
            await axios.get(url + 'discover/movie' + process.env.API_KEY + '&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=' + randomNum + name + '&with_original_language=en')
                .then((response) => {
                    let array = response.data;
                    let randomNum2 = Math.floor(Math.random() * 20);
                    let movie = array.results[randomNum2];
                    movieID = movie.id;
                });

            //gets the movie facts
            await axios.get(url + 'movie/' + movieID + process.env.API_KEY + '&language=en-US')
                .then((response) => {
                    let movie = response.data;
                    let gen = '';
                    let overview, rDate, tag, rating, runtime, genre, link, title;

                    for (let i = 0; i < movie.genres.length; i++) {
                        (i == movie.genres.length - 1) ? gen += `${movie.genres[i].name} ` : gen += `${movie.genres[i].name}, `;
                    }

                    //makes sure that no embeded fields are null
                    (movie.genres.length < 1) ? genre = "No Genre" : genre = gen;
                    (!movie.release_date) ? rDate = "No Release Date" : rDate = movie.release_date;
                    (!movie.overview) ? overview = "No Overview" : overview = movie.overview;
                    (!movie.tagline) ? tag = "No Tagline" : tag = movie.tagline;
                    (!movie.vote_average) ? rating = "No Rating" : rating = movie.vote_average + "/10";
                    (!movie.runtime) ? runtime = "No Runtime" : runtime = movie.runtime + " min";
                    (!movie.imdb_id) ? link = "tt0241527" : link = movie.imdb_id;
                    (!movie.title) ? title = "No Title" : title = movie.title;

                    const embed = new Discord.MessageEmbed()
                        .setColor('#827CC5')
                        .setTitle(title)
                        .setURL(`https://www.imdb.com/title/${link}/`)
                        .addFields(
                            { name: 'Overview:', value: overview },
                            { name: 'Release date:', value: rDate },
                            { name: 'Tagline:', value: tag },
                            { name: 'Rating:', value: rating },
                            { name: 'Runtime:', value: runtime },
                            { name: 'Genres:', value: genre },
                        );
                    message.channel.send(embed);
                });
        }
    } else {
        message.channel.send("Please re enter your command. For instructions type !help");
    }
});

//gets genre ID based off of command
function getGenreID(command) {
    if (command === "action" |
        command === "adventure" |
        command === "animation" |
        command === "comedy" |
        command === "crime" |
        command === "documentary" |
        command === "drama" |
        command === "family" |
        command === "fantasy" |
        command === "history" |
        command === "horror" |
        command === "music" |
        command === "mystery" |
        command === "romance" |
        command === "science_fiction" |
        command === "tv_movie" |
        command === "thriller" |
        command === "war" |
        command === "western" |
        command === "random") {
        for (var i = 0; i < genres.length; i++) {
            if (genres[i].name === command) {
                return genres[i].id;
            }
        }
    }
    return -1;
}
client.login(process.env.BOT_TOKEN);
