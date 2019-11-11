var https = require('https');

var format = 'tsv';         // Format you'd like to parse. `tsv` or `csv`
var id = '1vs2o4E9ptn970Qttt4rTevyKLktSJIiBxX_nGuwKmE0'; // The Google Sheet ID found in the URL of your Google Sheet.
var sheetId = 2;            // The Page ID of the Sheet you'd like to export. Found as `gid` in the URL.

https.get('https://docs.google.com/spreadsheets/d/' + id + '/export?format=' + format + '&id=' + id + '&gid=' + sheetId, function(resp) {

  var body = '';

  resp
    .on('data', function(data) {

      body += ab2str(data);

    })
    .on('end', function() {

      var json = [];
      var rows = body.split(/\r\n/i);

      for (var i = 0; i < rows.length; i++) {
        json.push(rows[i].split(/\t/i));
      }

    //   fs.writeFileSync(path.resolve(__dirname, './sheet.json'), JSON.stringify(json));
      console.log('Generated sheet.json',json);

    });

});

function ab2str(buf) {
  return String.fromCharCode.apply(null, new Uint16Array(buf));
}