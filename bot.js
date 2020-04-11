const axios = require('axios');
const Discord = require('discord.js');

const genres = require('./genres.json');
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
            gen += `${genres[i].name} `;
        }
        message.channel.send(`Please enter !genre\nGenres include... ${gen}`);
    }
    else if (command === "action" |
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
        let name = "";
        if (command !== "random") {
            let genreID = getGenreID(command);
            if (genreID > 0) {
                name = "&with_genres=" + genreID;
            }
        }
        let randomNum = Math.floor(Math.random() * 50) + 1;
        let movieID;
        //finds the random movie.
        await axios.get(url + 'discover/movie' + process.env.API_KEY + '&language=en-US &sort_by=popularity.desc&include_adult=false&include_video=false&page=' + randomNum + name)
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
                for (let i = 0; i < movie.genres.length; i++) {
                    gen += `${movie.genres[i].name} `;
                }
                const embed = new Discord.MessageEmbed()
                    .setColor('#827CC5')
                    .setTitle(movie.title)
                    .setURL(`https://www.imdb.com/title/${movie.imdb_id}/`)
                    .addFields(
                        { name: 'Overview:', value: movie.overview },
                        { name: 'Release date:', value: movie.release_date },
                        { name: 'Tagline:', value: movie.tagline },
                        { name: 'Rating:', value: movie.vote_average + '/10' },
                        { name: 'Runtime:', value: movie.runtime + 'min' },
                        { name: 'Genres:', value: gen },
                    );
                message.channel.send(embed);
            });
    } else {
        message.channel.send("Please re enter your command. For instructions type !help");
    }
});

function getGenreID(command) {
    for (var i = 0; i < genres.length; i++) {
        if (genres[i].name === command) {
            return genres[i].id
        }
    }
    return -1;
}
client.login(process.env.BOT_TOKEN);