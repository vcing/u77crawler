import http from 'http';
import express from 'express';
import Status from './Status.js';
import Crawler from './websites';
import gplay from 'google-play-scraper';
import store from 'app-store-scraper';

let app = express();

global.status = new Status();
// global.crawler = new Crawler();

// global.crawler.start();

app.get('/',async (req,res,next) => {
    // await appStoreFetch();
    res.send('ok');
});

app.get('/test',async (req,res,next) => {
    gplay.list({
        collection: gplay.collection.NEW_FREE,
        category: gplay.category.GAME,
        country:'us',
        num:100,
        fullDetail: true
    }).then(result => {
        res.json(result);
    })
});

app.get('/data',async (req,res,next) => {
    let results = await Promise.all([store.list({
        collection: store.collection.NEW_FREE_IOS,
        category: store.category.GAMES,
        lang:'en',
        country:'us',
        num:100
    }),store.list({
        collection: store.collection.NEW_PAID_IOS,
        category: store.category.GAMES,
        lang:'en',
        country:'us',
        num:100
    }),gplay.list({
        collection: gplay.collection.NEW_FREE,
        category: gplay.category.GAME,
        country:'us',
        num:100
    }),gplay.list({
        collection: gplay.collection.NEW_PAID,
        category: gplay.category.GAME,
        country:'us',
        num:100
    })]);
    res.json({
        appStoreFree:results[0],
        appStorePaid:results[1],
        gplayFree:results[2],
        gplayPaid:results[3]
    });
})

app.get('/ping',(req,res,next) => {
    res.send('cool');
});

let server = http.createServer(app, () => console.log('server started.....'));
server.listen(80);