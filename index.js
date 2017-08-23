require('dotenv').config();

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
    });

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

getAccessToken(username, password)
    .then(({token: accessToken}) => {
        getHistory(accessToken)
            .then(console.log)
            .catch(error => console.error("Unable to retrieve history", error));
    })
    .catch(error => console.error("Unable to retrieve access token", error));