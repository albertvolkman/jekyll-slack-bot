var axios = require('axios');

module.exports = (file, today) => {
  let api_resource = 'https://api.github.com/repos/' + process.env.GITHUB_REPO + '/contents/' + process.env.JEKYLL_COLLECTION + '/' + today + '.md';
  let body = {
    "message": `Sermon: ${today}`,
    "committer": {
      "name": process.env.GITHUB_NAME,
      "email": process.env.GITHUB_EMAIL
    },
    "content": Buffer.from(file).toString('base64')
  };

  return axios.put(api_resource, body, { params: { access_token: process.env.GITHUB_TOKEN } })
    .catch(err => console.log(err));
};
