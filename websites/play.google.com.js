import gplay from 'google-play-scraper';
import fs from 'fs';
import path from 'path';
import moment from 'moment';

export const NAME = 'gplay';
export const FILENAMES = {
    NEW:'android_new_free_games.json',
    PAID:'android_new_paid_games.json'
}

export default async function fetch() {
    let status = global.status.get(NAME);
    if(!status){
        status = {};
        status[gplay.collection.NEW_FREE] = 0;
        status[gplay.collection.NEW_PAID] = 0;
    }

    let newFreeGames = await gplay.list({
        collection: gplay.collection.NEW_FREE,
        category: gplay.category.GAME,
        country:'us',
        num:100,
        fullDetail: true
    });
    let newPaidGames = await gplay.list({
        collection: gplay.collection.NEW_PAID,
        category: gplay.category.GAME,
        country:'us',
        num:100,
        fullDetail: true
    });

    newFreeGames = filterGames(status[gplay.collection.NEW_FREE],newFreeGames);
    newPaidGames = filterGames(status[gplay.collection.NEW_PAID],newPaidGames);

    combineAndSaveResult(newFreeGames,FILENAMES.NEW);
    combineAndSaveResult(newPaidGames,FILENAMES.PAID);

    status[gplay.collection.NEW_FREE] = newFreeGames[0] ? newFreeGames[0].released : status[gplay.collection.NEW_FREE];
    status[gplay.collection.NEW_PAID] = newPaidGames[0] ? newPaidGames[0].released : status[gplay.collection.NEW_PAID];

    global.status.set(NAME,status);

    return {
        [FILENAMES.NEW]:newFreeGames.length,
        [FILENAMES.PAID]:newPaidGames.length
    }
}

function filterGames(unix,games) {
    let result = [];
    for(let index in games) {
        let game = games[index];
        let releaseUnix = moment(game.released).unix();
        if(unix === 0 || releaseUnix > unix) {
            result.push({
                title:game.title,
                icon:game.icon,
                released:releaseUnix,
                url:game.url
            });
        }
    }
    return result;
}

function combineAndSaveResult(newResult,filename) {
    let filePath = path.join(__dirname,'..','result',filename);
    let folderPath = path.join(__dirname,'..','result');
    let oldResult;

    if(!fs.existsSync(folderPath)) fs.mkdirSync(folderPath);

    if(fs.existsSync(filePath)) {
        try {
            oldResult = JSON.parse(fs.readFileSync(filePath));
        }catch(e) {
            console.log(e);
            oldResult = [];
        }
    }else {
        oldResult = [];
    }
    let result = newResult.concat(oldResult);
    fs.writeFileSync(filePath,JSON.stringify(result));
}