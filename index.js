require('dotenv').config();
const moment = require('moment');
const request = require('request-promise-native');

// sipgate REST API settings
const apiUrl = 'https://api.sipgate.com/v2';

const getAccessToken = (username, password) =>
    request({
        uri: `${apiUrl}/authorization/token`,
        method: 'POST',
        body: {
            username,
            password
        },
        json: true
    })
        .then(result => result.token);

const getHistory = (accessToken, userId = 'w0') =>
    request({
        uri: `${apiUrl}/${userId}/history`,
        qs: {
            types: 'VOICEMAIL'
        },
        headers: {
            'User-Agent': 'Request-Promise',
            'authorization': `Bearer ${accessToken}`
        },
        json: true
    });

const username = process.env.USERNAME;
const password = process.env.PASSWORD;

let mostRecentHistoryItem = moment(0);
setInterval(() => {
    getAccessToken(username, password)
        .then(accessToken => {
            getHistory(accessToken)
                .then(result => {
                    const newItems = result.items
                        .filter(item =>
                            moment.max(moment(item.created), mostRecentHistoryItem) === moment(item.created)
                        );

                    console.log(result.items);
                    console.log(newItems);

                    mostRecentHistoryItem = result.items
                        .map(item => moment(item.created))
                        .reduce(
                            (current, acc) => moment.max(current, acc),
                            mostRecentHistoryItem
                        );
                })
                .catch(error => console.error("Unable to retrieve history", error));
        })
        .catch(error => console.error("Unable to retrieve access token", error));
}, process.env.POLLING_INTERVAL_MS || 60000);