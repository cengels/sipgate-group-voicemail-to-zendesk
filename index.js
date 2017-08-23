const queryString = require('querystring');
const express = require('express');
const session = require('express-session');
const request = require('request-promise-native');

// sipgate REST API settings
const apiUrl = 'https://api.sipgate.com/v2';
const desiredScope = 'history:read';
const clientId = process.env.npm_config_client_id;
const clientSecret = process.env.npm_config_client_secret;

if (!clientId || clientId === 'CLIENT_ID' || !clientSecret || clientSecret === 'CLIENT_SECRET') {
  console.log('Please provide a client id and secret in this project .npmrc file.');
  process.exit(1);
}

// URL constants
const port = process.env.npm_config_port;
const appUrl = `http://localhost:${port}`;
const authPath = '/authorize';
const authRedirectUrl = `${appUrl}${authPath}`;
const authUrl = `https://api.sipgate.com/login/third-party/protocol/openid-connect`;
const apiAuthUrl = `${authUrl}/auth?` + queryString.stringify({
    client_id: clientId,
    redirect_uri: authRedirectUrl,
    scope: desiredScope,
    response_type: 'code',
  });


// Initialize express app
const app = express();
app.use(session({
  secret: 'sipgate-rest-api-demo',
  cookie: { maxAge: 60000 },
  resave: false,
  saveUninitialized: false
}));

app.get('/', function (req, res) {
  const accessToken = req.session['accessToken'];

  if (!accessToken) {
    res.redirect(authPath);
    return;
  }

  // 	getHistory = (userId, phonelineId, types, directions, limit) => {

    const userId = 'w0';
    const options = {
        uri: `${apiUrl}/${userId}/history`,
        qs: {
            types: 'VOICEMAIL'
        },
        headers: {
            'User-Agent': 'Request-Promise',
            'authorization': `Bearer ${accessToken}`
        },
        json: true // Automatically parses the JSON string in the response
    };

    request(options)
        .then(function (result) {
            res.send('<html><body><code><pre>' + JSON.stringify(result, null, 2) + '</pre></code></body></html>')
        })
        .catch(console.error);
});

app.get(authPath, function (req, res) {

  const authorizationCode = req.query.code;

  if (!authorizationCode) {
    console.log("Not authenticated yet! Redirecting to " + apiAuthUrl);
    res.redirect(apiAuthUrl);
    return;
  }

  console.log("Got authorization code: " + authorizationCode);

  request.post({
    url: `${authUrl}/token`,
    form: {
      client_id: clientId,
      client_secret: clientSecret,
      code: authorizationCode,
      redirect_uri: authRedirectUrl,
      grant_type: 'authorization_code',
    },
  })
    .then(function (body) {
      const response = JSON.parse(body);
      console.log("Got authorization data", response)
      req.session['accessToken'] = response['access_token'];
      res.redirect('/');
    })
    .catch(function (e) {
      console.log("Error getting access_token");
      res.redirect(apiAuthUrl);
    });
});

app.listen(port, function () {
  console.log(`Listening on port ${port}. Open ${appUrl} in your browser.`);
});