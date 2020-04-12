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
        let str = "";
        if (args.length) {
            for(let j = 0; j < args.length; j++){
                let gid = getGenreID(args[j]);
                if(gid > 0){
                str += "," + gid;  
                }
            }
        }
        if (command !== "random") {
            let genreID = getGenreID(command);
            if (genreID > 0) {
                name = "&with_genres=" + genreID + str;
            }
        }
        let pages = 1;
        //gets max pages
        await axios.get(url + 'discover/movie' + process.env.API_KEY + '&language=en-US &sort_by=popularity.desc&include_adult=false&include_video=false&page=' + pages + name)
            .then((response) => {
                let arr = response.data;
                pages = arr.total_pages;
            });
        let randomNum = 1;
        (pages >= 50) ? randomNum = Math.floor(Math.random() * 50) + 1 : randomNum = pages;

        let movieID;
        //finds the random movie (but in top 50 pages so its not obscure (each page has 20 movies)).
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
                let overview,rDate,tag,rating,runtime,genre,link,title;

                for (let i = 0; i < movie.genres.length; i++) {
                    gen += `${movie.genres[i].name} `;
                }

                //makes sure that no embeded fields are null
                (movie.genres.length<1) ? genre = "No Genre" : genre = gen;
                (!movie.release_date) ? rDate = "No Release Date" : rDate = movie.release_date;
                (!movie.overview) ? overview = "No Overview" : overview = movie.overview;
                (!movie.tagline) ? tag = "No Tagline" : tag = movie.tagline;
                (!movie.vote_average) ? rating = "No Rating" : rating = movie.vote_average + "/10";
                (!movie.runtime) ? runtime = "No Runtime" : runtime = movie.runtime +" min";
                (!movie.imdb_id) ? link = "tt0241527" : link = movie.imdb_id;
                (!movie.title) ? title = "No Title" : title = movie.title;
                const embed = new Discord.MessageEmbed()
                    .setColor('#827CC5')
                    .setTitle(title)
                    .setURL(`https://www.imdb.com/title/${link}/`)
                    .addFields(
                        { name: 'Overview:', value: overview},
                        { name: 'Release date:', value: rDate },
                        { name: 'Tagline:', value: tag},
                        { name: 'Rating:', value: rating },
                        { name: 'Runtime:', value: runtime },
                        { name: 'Genres:', value: genre },
                    );
                message.channel.send(embed);
            });
    } else {
        message.channel.send("Please re enter your command. For instructions type !help");
    }
});

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
        command === "random"){
    for (var i = 0; i < genres.length; i++) {
        if (genres[i].name === command) {
            return genres[i].id;
        }
    }
}
    message.channel.send(command + "is not correct");
    return -1;
}
client.login(process.env.BOT_TOKEN);