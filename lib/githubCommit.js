var axios = require('axios');

module.exports = (file, filename) => {
  return new Promise(function(resolve, reject) {
    let api_resource = 'https://api.github.com/repos/' + process.env.GITHUB_REPO + '/contents/' + process.env.JEKYLL_COLLECTION + '/' + filename;
    let body = {
      "message": 'Message created',
      "committer": {
        "name": process.env.GITHUB_NAME,
        "email": process.env.GITHUB_EMAIL
      },
      "content": Buffer.from(file).toString('base64')
    };
    axios.put(api_resource, body, { params: { access_token: process.env.GITHUB_TOKEN } })
      .then(() => resolve());
  });
};
