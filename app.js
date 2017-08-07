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

// cross-domain
app.use((req, res, next) => {
    let origin = req.headers.origin;
    if (["http://www.u77.com",
        "http://dev.u77.com",
        "http://*.u77.com",
        "http://n.u77.com",
        "http://u77backstage.leanapp.cn"].indexOf(origin) !== -1) {
        res.header('Access-Control-Allow-Origin', origin);
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
        res.header('Access-Control-Allow-Credentials', true);
        res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE');
    }
    next();
});

app.get('/', async (req, res, next) => {
    // await appStoreFetch();
    res.send('ok');
});

app.get('/test', async (req, res, next) => {
    gplay.list({
        collection: gplay.collection.NEW_FREE,
        category: gplay.category.GAME,
        country: 'us',
        num: 100,
        fullDetail: true
    }).then(result => {
        res.json(result);
    })
});

app.get('/data', async (req, res, next) => {
    let results = await Promise.all([store.list({
        collection: store.collection.NEW_FREE_IOS,
        category: store.category.GAMES,
        lang: 'en',
        country: 'us',
        num: 100
    }), store.list({
        collection: store.collection.NEW_PAID_IOS,
        category: store.category.GAMES,
        lang: 'en',
        country: 'us',
        num: 100
    }), gplay.list({
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

    let games = results.map((result, index) => {
        return result.map((game) => {
            let platform, type;
            switch (index) {
                case 0:
                    platform = 'iOS';
                    type = 'free';
                    break;
                case 1:
                    platform = 'iOS';
                    type = 'paid';
                    break;
                case 2:
                    platform = 'Android';
                    type = 'free';
                    break;
                case 3:
                    platform = 'Android';
                    type = 'paid';
                    break;
            }
            return {
                title: game.title,
                icon: game.icon,
                url: game.url,
                platform,
                type
            }
        });
    });

    res.json([].concat(...games));
})

app.get('/ping', (req, res, next) => {
    res.send('cool');
});

let server = http.createServer(app, () => console.log('server started.....'));
server.listen(80);