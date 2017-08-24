# Simple sipgate voicemail to zendesk script

This project gives you a way to easily retrieve all group voicemails from a certain client, return them, and process them (e.g. by sending them to your help desk).

## Install

1. Download this project.
2. Install NPM dependencies: `npm install`
3. [Create your own API client using the command line.](https://developer.sipgate.io/v2.0/docs/managing-third-party-clients-using-the-command-line)
4. Copy `.npmrc.dist` to `.npmrc` and fill `client_id` and `client_secret` with your generated credentials.
5. Run application: `npm start`
6. Visit [localhost:3000](http://localhost:3000).
