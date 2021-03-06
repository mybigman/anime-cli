#!/usr/bin/env node

const fetch = require("node-fetch");
const pjson = require("./package.json");
const Configstore = require('configstore');
const treasure = require('./RA.json');
const list = treasure.list;

const config = new Configstore(pjson.name, {
  setLimit: false,
  limit: 100,
  onlyMatches: false
})

let limvalue = 100;
let query = process.argv;
let search = ' ';
if(query.length <= 2) {
  search = list[Math.floor(Math.random() * list.length)].split(' ').join('_');
} else {
  search = query.slice(2,query.length).join('_');
}


const arg = query;


let Table = require("cli-table3");
let table = new Table({
  head: ["Title", "Episodes", "Type", "Status"],
  colWidths: [46, 11],
});


const chalk = require("chalk");
const greenText = "\x1b[32m";
const resetFont = "\x1b[0m";
const cyanText = "\x1b[36m";

if (arg[2] === "--help" || arg[2] === "-h") {
  console.log(`
NAME
	${cyanText}anime-cli: command line application to fetch anime details${resetFont}

USAGE
	${cyanText}anime-cli [ <anime name>  |  arguments ]
	anime-cli [ <anime name> |  -help  | --h ...]${resetFont}

OPTIONS
	<anime name>
		The name of the anime whose information you would
		like to fetch
		${greenText}eg: anime-cli Naruto${resetFont}
	
	help, --h
		view this information
		${greenText}eg: anime-cli -help${resetFont}

	version, --v
		view the version number of the anime-cli app
		${greenText}eg: anime-cli -version${resetFont}

DESCRIPION
	anime-cli is a command line application that can be used to
	fetch information regarding the user-queried anime, like
	number of episodes, type of anime and it's airing status.
	  `);
  return;
}

if(arg[2] === "--version" || arg[2] === "-v") {
	console.log(chalk.cyanBright(`anime-cli\nversion: ${pjson.version}\n`))
	return;
}

if(arg.includes('setLimit') && arg.includes('true') ) {
  config.set('setLimit', true);
  if(arg[4] === undefined) {
    console.log('Add the limit value pls');
  } else {
    config.set('limit', parseInt(arg[4]));
  }
  return;
}
else if(arg.includes('setLimit') && arg.includes('false')) {
  config.set('setLimit', false);
  return;
}

if(arg.includes('onlyMatches') && arg.includes('true')) {
  config.set('onlyMatches', true);
  return;
}
else if (arg.includes('onlyMatches') && arg.includes('false')) {
  config.set('onlyMatches', false);
  return;
}

//let search = '';
//if ()


fetch(`https://api.jikan.moe/v3/search/anime?q=${search}`)
  .then((response) => response.json())
  .then((data) => {
    limvalue = config.get('setLimit') ? config.get('limit') : 100;
    const bunch = data.results.slice(0,limvalue);
    let status = "";
    let PTitle = "";

    if (arg[2] !== undefined) {
      arg[2] = arg[2].toLowerCase();
    }

    bunch.map((item) => {


      if(config.get('onlyMatches') == true) {
        
  
        if (item.airing === true) {
  
          status = chalk.red("Ongoing");
        } else if (item.airing === false) {
  
          status = chalk.cyanBright("Finished");
        }

        if (item.title.toLowerCase().includes(arg[2])) {
          PTitle = chalk.bold.green;
          table.push([
            PTitle(item.title),
            item.episodes,
            chalk.yellow(item.type),
            status,
          ]);
        }
  
  
       
      }
      else if(config.get('onlyMatches') == false) {
        if (item.title.toLowerCase().includes(arg[2])) {
          PTitle = chalk.bold.green;
        } else {
          PTitle = chalk.bold.white;
        }

        if (item.airing === true) {
  
          status = chalk.red("Ongoing");
        } else if (item.airing === false) {
  
          status = chalk.cyanBright("Finished");
        }

        
        table.push([
          PTitle(item.title),
          item.episodes,
          chalk.yellow(item.type),
          status,
        ]);
      }
    });

    console.log(table.toString());
  })
  .catch((error) => console.log(error));
