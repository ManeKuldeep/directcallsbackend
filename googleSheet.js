const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
const admin = require("firebase-admin");
// const serviceAccount = require("./tradesecretgroups-firebase-adminsdk-nyc0b-1d61d7cd08.json");
const serviceAccount = require("./directcalls-35713-firebase-adminsdk-dy36v-d3d651ddce.json");
var schedule = require('node-schedule');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://directcalls-35713.firebaseio.com/"
});

const db = admin.database();

var scheduler = schedule.scheduleJob('*/1 9-16 * * *', function () {
  new start();
});
// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

function start(){
    // Load client secrets from a local file.
    fs.readFile('credentials.json', (err, content) => {
      if (err) return console.log(new Date().toString(),'Error loading client secret file:', err);
      // Authorize a client with credentials, then call the Google Sheets API.
      authorize(JSON.parse(content), listMajors);
    });
}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log(new Date().toString(),'Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error while trying to retrieve access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log(new Date().toString(),'Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

/**
 * Prints the names and majors of students in a sample spreadsheet:
 * @see https://docs.google.com/spreadsheets/d/1vs2o4E9ptn970Qttt4rTevyKLktSJIiBxX_nGuwKmE0/edit
 * @see https://docs.google.com/spreadsheets/d/1ip2u3_t4pjUHcX7Uvcp8xNrSjD7-2zGP9ckSaZN2jMA/edit?ts=5def1bc6
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 */
function listMajors(auth) {
    console.log(new Date().toString(),"started");
    
  const sheets = google.sheets({version: 'v4', auth});
  sheets.spreadsheets.values.get({
    spreadsheetId: '1ip2u3_t4pjUHcX7Uvcp8xNrSjD7-2zGP9ckSaZN2jMA',
    range: 'Calculation!A:E',
  }, (err, res) => {
    if (err) return console.log(new Date().toString(),'The API returned an error: ' + err);
    const rows = res.data.values;
    if (rows.length) {
        for(let i=1; i<4; i++){
            let set = {}
            set[rows[0][0]]=rows[0][1]
            set[rows[2][0]]=rows[2][i];
            set[rows[3][0]]=rows[3][i];
            set[rows[4][0]]=rows[4][i];
            set[rows[5][0]]=rows[5][i];
            set[rows[6][0]]=rows[6][i];
            set[rows[7][0]]=rows[7][i];
            db.ref(`/OP_DATA/${rows[1][i]}`).update(set)
        }
        console.log(new Date().toString(),"Firbase write done.");
        
    } else {
      console.log(new Date().toString(),'No data found.');
    }
  });
}