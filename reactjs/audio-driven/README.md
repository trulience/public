# Sample code

Follow the instructions below to drive your interactive avatar with an audio mediastream.

## Instructions

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
Note: You can find your authorisation token under *Account* when logged into [Trulience](https://www.trulience.com). Each avatar has its own avatar ID which is made available to you once your avatar has been created.


### Query Parameters

When integrating the app in an iframe, the following query parameters can be utilized:

| Parameter                 | Type     | Default Value                                | Description                                                              |
|---------------------------|----------|----------------------------------------------|--------------------------------------------------------------------------|
| `avatarId`                | String   | `process.env.REACT_APP_TRULIENCE_AVATAR_ID`  | The ID of the avatar to be used in the app.                              |
| `token`                   | String   | `process.env.REACT_APP_TRULIENCE_TOKEN`      | The token used for authentication.                                       |
| `sdkURL`                  | String   | `process.env.REACT_APP_TRULIENCE_SDK_URL`    | The URL of the SDK to be used.                                           |


Build and run the app
```
npm install
npm run build
npm run start
```

Open [http://localhost:3000](http://localhost:3000) to view your interactive avatar in a browser.
