var axios = require('axios');

module.exports = file_id => {
  return axios.get('https://slack.com/api/files.info', { params: { token: process.env.SLACK_ACCESS_TOKEN, file: file_id }})
    .then(res => res.data.file);
};
