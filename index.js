var Client = require('node-rest-client').Client;
var client = new Client();

function getSheetData() {
    console.log("Started...")
    var req = client.get("https://spreadsheets.google.com/feeds/cells/1vs2o4E9ptn970Qttt4rTevyKLktSJIiBxX_nGuwKmE0/2/public/values?alt=json", (data, response) => {
        let d = JSON.parse(JSON.stringify(data));
        // let a = d.feed.entry;
        // a.forEach(element => {
        //     let b = JSON.parse(JSON.stringify(element));
        //  console.log(b.content['$t'])
        // });
        console.log(d.data);
    });

    req.on('requestTimeout', function (req) {
        console.log("request has expired " + req);
    });

    req.on('responseTimeout', function (res) {
        console.log("response has expired " + res);
    });

    //it's usefull to handle request errors to avoid, for example, socket hang up errors on request timeouts 
    req.on('error', function (err) {
        console.log("request error " + err);
    });
}

getSheetData();