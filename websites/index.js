import appStoreFetch from './itunes.apple.com.js';
import googlePlayFetch from './play.google.com.js';

const status = {
    running:1,
    stop:0
}

export default class Crawler {
    constructor() {
        this.status = status.stop;
    }

    start() {
        this.intervalId = setInterval(this.run.bind(this),60000);
    }

    stop() {
        clearInterval(this.intervalId);
    }

    run() {
        Promise.all([appStoreFetch(),googlePlayFetch()]).then((results) => {
            console.log(results);
        },(err) => {
            console.log(err);
        });
    }
}