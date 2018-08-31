var axios = require('axios');

module.exports = channel => {
  var post = {
    headers: {
      Authorization: 'Bearer ' + process.env.SLACK_ACCESS_TOKEN,
    },
    params: {
      channel: channel,
      text: 'Podcast created! ' + process.env.DOMAIN + 'messages/' + date.getFullYear() + '/' + ('0' + date.getMonth()).slice(-2) + '/' + ('0' + date.getDate()).slice(-2) + '/'
    }
  };

  return axios.post('https://slack.com/api/chat.postMessage', post.params, { headers: post.headers });
};
