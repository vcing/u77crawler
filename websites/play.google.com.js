import gplay from 'google-play-scraper';
import fs from 'fs';
import path from 'path';
import moment from 'moment';

export const NAME = 'gplay';
export const FILENAMES = {
    FREE:'android_new_free_games.json',
    PAID:'android_new_paid_games.json'
}

// simply refresh cache
export default async function fetch() {
    let results = Promise.all([gplay.list({
        collection: gplay.collection.NEW_FREE,
        category: gplay.category.GAME,
        country: 'us',
        num: 100
    }), gplay.list({
        collection: gplay.collection.NEW_PAID,
        category: gplay.category.GAME,
        country: 'us',
        num: 100
    })]);

    saveToFile(results[0],FILENAMES.FREE);
    saveToFile(results[1],FILENAMES.PAID);
}


function saveToFile(content,filename) {
    let filePath = path.join(__dirname,'..','result',filename);
    let folderPath = path.join(__dirname,'..','result');
    let oldResult;

    if(!fs.existsSync(folderPath)) fs.mkdirSync(folderPath);

    fs.writeFileSync(filePath,JSON.stringify(content));
}