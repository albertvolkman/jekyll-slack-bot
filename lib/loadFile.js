var axios = require('axios');

module.exports = file_info => {
  return axios.get(file_info.url_private, { headers: { Authorization: "Bearer " + process.env.SLACK_ACCESS_TOKEN }, responseType: 'arraybuffer' })
    .then(data => data);
};
