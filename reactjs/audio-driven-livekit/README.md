# Sample code

Follow the instructions below to drive your interactive avatar using livekit.
This sample code assumes you have setup your own LiveKit Server and LiveKit Agent.
The audio from the app is sent to livekit. The Livekit Agent will generate answers to the user's input with the LLMs and use TTS to return the audio to the app.
This output audio from LiveKit Agent is then set as the media stream on the Trulience object to make the avatar speak the response. 

## Instructions

Go to the project directory:
```
cd audio-driven-livekit
```

In this folder, add a .env file with the following contents:
```
REACT_APP_TRULIENCE_SDK_URL=https://trulience.com/sdk/trulience.sdk.js
REACT_APP_TRULIENCE_AVATAR_ID=XXXXXXXXXXXXXXXXXXXX
REACT_APP_TRULIENCE_TOKEN=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
REACT_APP_LIVEKIT_URL=https://path/to/your/livekit/server
REACT_APP_LIVEKIT_API_KEY=XXXXXXXXXXXXXXXXXXXX
REACT_APP_LIVEKIT_API_SECRET=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

```
Note: You can find your authorisation token under *Account* when logged into [Trulience](https://www.trulience.com). Each avatar has its own avatar ID which is made available to you once your avatar has been created.

Make sure to set "STT Config" and "TTS Config" to "None" while configuring the avatar.

Build and run the sample app using:
```
npm install
npm run build
npm run start
```

Open [http://localhost:3000](http://localhost:3000) to view your interactive avatar in a browser.
