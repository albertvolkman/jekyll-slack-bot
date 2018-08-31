var fs = require('fs');
var getDuration = require('get-audio-duration');
var tmp = require('tmp');

module.exports = file => {
  return new Promise(function(resolve, reject) {
    var tmpFile = tmp.fileSync();
    fs.writeFileSync(tmpFile.name, file);

    getDuration(tmpFile.name)
      .then(duration => {
        var minutes = Math.floor(duration / 60);
        var seconds = Math.round(((duration / 60) % 1) * 60);
        tmpFile.removeCallback();

        resolve(minutes + ':' + seconds);
      });
  });
};
