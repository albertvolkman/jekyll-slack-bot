var ftp = require('promise-ftp');

module.exports = (file, filename) => {
  // Upload file to FTP.
  const ftp_config = {
    host: process.env.FTP_HOST,
    user: process.env.FTP_USER,
    password: process.env.FTP_PASS,
  };

  var c = new ftp();
  return c.connect(ftp_config)
    .then(() => c.put(file, process.env.FTP_PATH + filename))
    .then(() => c.end());
};
