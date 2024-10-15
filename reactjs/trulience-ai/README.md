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
Note: You can find your authorization token under *Account* when logged into [Trulience](https://www.trulience.com). Each avatar has its own avatar ID which is made available to you once your avatar has been created.

Build and run the app using:
```
npm install
npm run build
npm run start
```

Open [http://localhost:3000](http://localhost:3000) to view your interactive avatar in a browser.

## Event: `trl-method-call`

### Purpose
- To dynamically call a method inside the `Trulience` class from the **parent iframe**.
- Supports both **synchronous** and **asynchronous** method execution.

### Event Payload Structure
The event must contain the following properties:

```javascript
{
  eventName: "trl-method-call",
  eventParams: {
    method: string,      // Name of the method to call in the Trl class
    args?: any[],        // Array of arguments to pass to the method (optional, defaults to [])
    callId?: string,     // Optional: Unique ID to track the call and match the response
  }
}
```

#### Sending a `trl-method-call` Event:
From the parent iframe, you can post a message to invoke a method in the `Trulience` class.

| Method                 | Example Payload                                         | Description                                        |
|------------------------|---------------------------------------------------------|----------------------------------------------------|
| `sendMessage`          | ` { "method": "sendMessage", "args": ["Hello"] } `      | Sends a chat message.                              |
| `setMicEnabled`        | ` { "method": "setMicEnabled", "args": [true] } `       | Enables the microphone.                            |
| `setSpeakerEnabled`    | ` { "method": "setSpeakerEnabled", "args": [false] } `  | Disables the speaker.                              |

---

### Example Usage in Code
Here’s how you can use the above methods in the parent iframe:

```javascript

const postMessageToIframe(data) {
  iframe.contentWindow.postMessage(data, "*");
}

// Send a message
postMessageToIframe({
  eventName: "trl-method-call",
  eventParams: {
    method: "sendMessage",
    args: ["Hello, World!"]
  }
});

// Set microphone status
postMessageToIframe({
  eventName: "trl-method-call",
  eventParams: {
    method: "setMicEnabled",
    args: [true]
  }
});

// Set speaker status
postMessageToIframe({
  eventName: "trl-method-call",
  eventParams: {
    method: "setSpeakerEnabled",
    args: [false]
  }
});
```

---

### Event: `trl-method-response`

The `trl-method-response` event is used to communicate the result or any errors back to the parent iframe after executing a method pass using `trl-method-call` 
This event is only emit if `callId` is provided.  

**Response Payload Structure**
```javascript
{
  callId: string,              // Matches the original callId for tracking
  status: "success" | "error",  // Indicates the execution status
  result?: any,                 // The result if successful
  error?: string                // Error message if failed
}
```

**Listen for Responses:** In the parent iframe, set up an event listener to handle the response:
  ```javascript
  window.addEventListener('message', (event) => {
    if (event.data.eventName === "trl-method-response") {
      const { callId, status, result, error } = event.data.eventParams;
      if (status === "success") {
        console.log("Success:", result);
      } else {
        console.error("Error:", error);
      }
    }
  });
  ```
---


## Error Handling
- If the specified method is not found in the `Trulience` class, a warning will be logged:
  ```bash
  Error: Method 'methodName' not found in Trl class.
  ```
- If the method execution fails, the error will be caught and sent back in the response (if `callId` is provided).

---

## Summary
- `trl-method-call` allows the parent iframe to dynamically call methods in the `Trulience` class with arguments.
- `trl-method-response` provides a mechanism to send results or errors back to the parent iframe.
- This event-driven system supports both synchronous and asynchronous calls, with tracking via `callId`.
