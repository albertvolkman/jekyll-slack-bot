/*jshint esversion: 6 */
require('dotenv').config();
const axios = require('axios');
const express = require('express');
const qs = require('querystring');
const slackValidateRequest = require('validate-slack-request');

const createMessage = require('./lib/createMessage.js');
const ftpFile = require('./lib/ftpFile.js');
const getFileDuration = require('./lib/getFileDuration.js');
const githubCommit = require('./lib/githubCommit.js');
const loadFile = require('./lib/loadFile.js');
const loadFileDetails = require('./lib/loadFileDetails.js');
const postMessage = require('./lib/postMessage.js');

var app = express();
app.use(express.json());
app.use(express.urlencoded());

// Start server
app.listen(process.env.PORT, function () {
  console.log("Listening on port " + process.env.PORT);
});

app.get('/oauth', function(req, res) {
  if (!req.query.code) {
    res.status(500);
    res.send({"Error": "Looks like we're not getting code."});
    console.log("Looks like we're not getting code.");
  }
  else {
    axios.get('https://slack.com/api/oauth.access', { params: {
        code: req.query.code,
        client_id: process.env.CLIENTID,
        client_secret: process.env.CLIENTSECRET
      } })
      .then(body => res.json(body))
      .catch(error => console.log(error));
  }
});

app.post('/file-upload-event', (req, res) => {
//  res.send(req.body.challenge);
  if (req.body.event && req.body.event.file_id) {
    // Load file details.
    axios.get('https://slack.com/api/files.info', { params: {
        token: process.env.SLACK_ACCESS_TOKEN,
        file: req.body.event.file_id
      }})
      .then((file_info) => {
        if (file_info.data.file.mimetype.split('/')[0] == 'audio') {
          file_info.data.file.channels.forEach((channel) => {
            var shares = file_info.data.file.shares.public[channel];
            var share = shares[shares.length - 1];
            var update = {
              headers: {
                Authorization: 'Bearer ' + process.env.SLACK_ACCESS_TOKEN,
              },
              params: {
                channel: channel,
                attachments: [{
                  token: process.env.SLACK_ACCESS_TOKEN,
                  "fallback": "You are unable to create a podcast message",
                  "callback_id": "create_podcast",
                  "color": "#d5ae43",
                  "attachment_type": "default",
                  "actions": [
                    {
                      "name": "open_dialog",
                      "text": "Create Podcast Message",
                      "type": "button",
                      "value": req.body.event.file_id,
                    }
                  ]
                }],
              }
            };

            axios.post('https://slack.com/api/chat.postMessage', update.params, { headers: update.headers });
          });
        }
      }).catch((err) => {
        res.sendStatus(500);
      });
  }
});

app.post('/command', function(req, res) {
  var payload = JSON.parse(req.body.payload);

  if (payload.actions && payload.actions[0].name == 'open_dialog') {
    const dialog = {
      token: process.env.SLACK_ACCESS_TOKEN,
      trigger_id: payload.trigger_id,
      dialog: JSON.stringify({
        title: 'Create a podcast message',
        callback_id: 'create_post',
        submit_label: 'Publish',
        elements: [
          {
            "type": "text",
            "label": "Title",
            "name": "title"
          },
          {
            "type": "textarea",
            "label": "Summary",
            "name": "summary",
            "optional": true
          }
        ],
        state: {
          file_id: payload.actions[0].value
        }
      }),
    };

    axios.post('https://slack.com/api/dialog.open', qs.stringify(dialog), { headers: { Authorization: 'Bearer ' + process.env.SLACK_ACCESS_TOKEN } })
      .then((result) => {
        //console.log('dialog.open: %o', result.data);
        res.send('');
      }).catch((err) => {
        //console.log('dialog.open call failed: %o', err);
        res.sendStatus(500);
      });
  }

  if (payload.type == 'dialog_submission' && payload.callback_id == 'create_post') {
    var date = new Date();
    var day = date.getDay();
    var diff = date.getDate() - day;
    date.setDate(diff);
    date.setHours(10);
    date.setMinutes(0);
    date.setSeconds(0);
    var sunday = new Date(date);
    var filename = new Date(sunday.getTime() - (sunday.getTimezoneOffset() * 60000 ))
      .toISOString()
      .split("T")[0];

    let front_matter = [
      {
        key: 'title',
        value: payload.submission.title,
      },
      {
        key: 'summary',
        value: (payload.submission.summary != null) ? payload.submission.summary : '',
      }
    ];

    var file_info = {};
    var file = {};

    loadFileDetails(payload.state)
      .then(data => {
        return new Promise(function(resolve, reject) {
          file_info = data;
          resolve();
        });
      })
      .then(() => loadFile(file_info))
      .then(({ data }) => file = data)
      .then(() => {
        front_matter.push({
          key: 'file',
          value: 'http://' + process.env.FTP_PATH + file_info.title
        });
        front_matter.push({
          key: 'length',
          value: file_info.size
        });
      })
      .then(() => ftpFile(file, file_info.title))
      .then(() => getFileDuration(file))
      .then(duration => {
        front_matter.push({
          key: 'duration',
          value: duration
        });
      })
      .then(() => createMessage(front_matter, sunday.toUTCString()))
      .then(content => githubCommit(content, filename))
      .then(message => postMessage(payload.channel.id));

    res.status(200);
    res.send();
  }
});
