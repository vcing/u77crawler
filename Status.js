import fs from 'fs';
import path from 'path';

let status;

export default class Status {
    constructor() {
        this.statusPath = path.join(__dirname,'status.json');
        if(fs.existsSync(this.statusPath)) {
            try {
                 status = JSON.parse(fs.readFileSync(this.statusPath));
            }catch(e) {
                console.log(e);
                this.initStatus();
            }
        }else {
            this.initStatus();
        }
        setInterval(this.saveToFile.bind(this),1000);//*60*30
    }

    initStatus() {
        status = {};
        this.needFresh = true;
        this.saveToFile();
    }

    get(name) {
        return status ? status[name] : undefined;
    }

    set(name,value) {
        status[name] = value;
        this.needFresh = true;
    }

    saveToFile() {
        if(!this.needFresh)return;
        fs.writeFile(this.statusPath,JSON.stringify(status))
    }
}