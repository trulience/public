# Sample code

Follow the instructions below to drive your avatar using Trulience-connected STT, LLM and TTS providers.

### Instructions

Go to the project directory:
```
cd trulience-ai
```

In this folder, add a .env file with the following contents:
```
REACT_APP_TRULIENCE_SDK_URL=https://trulience.com/sdk/trulience.sdk.js
REACT_APP_TRULIENCE_AVATAR_ID=XXXXXXXXXXXXXXXXXXXX
REACT_APP_TRULIENCE_TOKEN=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```
Note: You can find your authorisation token under *Account* when logged into [Trulience](https://www.trulience.com). Each avatar has its own avatar ID which is made available to you once your avatar has been created.

Build and run the app using:
```
npm install
npm run build
npm run start
```

Open [http://localhost:3000](http://localhost:3000) to view your interactive avatar in a browser.

### Query Parameters

When integrating the app in an iframe, the following query parameters can be used:

| Parameter                 | Type     | Default Value                                | Description                                                              |
|---------------------------|----------|----------------------------------------------|--------------------------------------------------------------------------|
| `connect`                 | Boolean  | `false`                                      | If set to true, the client will connect automatically when visiting.     |
| `showFullscreenAvatar`    | Boolean  | `false`                                      | If set to true, the avatar wil be display in fullscreen mode.            |
| `registerTrlEvents`       | String   | `""`                                         | List of events that should be notified to iframe's parent.               |
| `avatarId`                | String   | `process.env.REACT_APP_TRULIENCE_AVATAR_ID`  | The ID of the avatar to be used in the app.                              |
| `token`                   | String   | `process.env.REACT_APP_TRULIENCE_TOKEN`      | The token used for authentication.                                       |
| `sdkURL`                  | String   | `process.env.REACT_APP_TRULIENCE_SDK_URL`    | The URL of the SDK to be used.                                           |
| `loadingBarColor`         | String   | `rgb(255, 98, 0)`                            | The color of the loading bar.                                            |


### Events from Parent iframe

The following events can be sent from the parent iframe to the app:

| Event Name               | Message Type     | Description                                                  |
|--------------------------|------------------|--------------------------------------------------------------|
| `trl-chat-send`          | String           | Triggers sending a chat message.                             |
| `trl-mic-set`            | Boolean          | Indicates the microphone status (enabled or disabled).       |
| `trl-speaker-set`        | Boolean          | Indicates the speaker status (enabled or disabled).          |
| `trl-avatar-chat-send`   | String           | Triggers sending a message from the avatar.                  |

### Example Event Format

To set the microphone status, the parent iframe can send the following command:

```json
{
  "command": "trl-mic-set",
  "message": true
}
```

### Notes

- Ensure to pass the necessary query parameters for proper functionality when embedding the app in an iframe.
- The app listens for the specified events from the parent iframe to handle user interactions effectively.
