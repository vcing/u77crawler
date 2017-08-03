import store from 'app-store-scraper';
import fs from 'fs';
import path from 'path';
import moment from 'moment';

export const NAME = 'appstore';
export const FILENAMES = {
    NEW:'ios_new_free_games.json',
    PAID:'ios_new_paid_games.json'
}

export default async function fetch() {
    let status = global.status.get(NAME);
    if(!status){
        status = {};
        status[store.collection.NEW_FREE_IOS] = 0;
        status[store.collection.NEW_PAID_IOS] = 0;
    }

    let newFreeGames = await store.list({
        collection: store.collection.NEW_FREE_IOS,
        category: store.category.GAMES,
        lang:'en',
        country:'us',
        num:100
    });
    let newPaidGames = await store.list({
        collection: store.collection.NEW_PAID_IOS,
        category: store.category.GAMES,
        lang:'en',
        country:'us',
        num:100
    });

    newFreeGames = filterGames(status[store.collection.NEW_FREE_IOS],newFreeGames);
    newPaidGames = filterGames(status[store.collection.NEW_PAID_IOS],newPaidGames);

    combineAndSaveResult(newFreeGames,FILENAMES.NEW);
    combineAndSaveResult(newPaidGames,FILENAMES.PAID);

    status[store.collection.NEW_FREE_IOS] = newFreeGames[0] ? newFreeGames[0].released : status[store.collection.NEW_FREE_IOS];
    status[store.collection.NEW_PAID_IOS] = newPaidGames[0] ? newPaidGames[0].released : status[store.collection.NEW_PAID_IOS];

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