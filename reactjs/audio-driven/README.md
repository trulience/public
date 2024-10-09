# Sample app to demonstrate usage of the Trulience SDK being driven by an audio mediastream via npm

## Run the following commands to get it working

Go to the project directory:
```
cd audio-driven
```

In this folder, add a .env file with the following contents:
```
REACT_APP_TRULIENCE_SDK_URL=https://trulience.com/sdk/trulience.sdk.js
REACT_APP_TRULIENCE_AVATAR_ID=XXXXXXXXXXXXXXXXXXXX
REACT_APP_TRULIENCE_TOKEN=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```
Note: You can find your authorisation token under *Account* when logged into [Trulience](https://www.trulience.com). Each avatar has its own avatar ID which is available once your avatar has been created.

Build and run the sample app using:
```
npm install
npm run build
npm run start
```

Open [http://localhost:3000](http://localhost:3000) to view it in your browser.
