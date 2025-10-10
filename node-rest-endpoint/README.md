# Trulience Rest Endpoint sample code

This is a sample **Express.js server** that demonstrates how to manage user sessions, handle chat messages, and send custom data callbacks for integration with the Trulience platform.

---

## 🚀 Features

* **Session Management**

  * `LOGIN` → start a session
  * `LOGOUT` → end a session

* **Chat Handling**

  * `CHAT` → echo back user messages
  * Special command `/push-custom-ssml-webhook` → triggers a callback (`/tslisten`)
  * Special command `/send-custom-ssml` → send the custom data as a response for testing using 
`?registerCustomSSML=trl-custom-rest-json` url param

* **Callback Support**

  * Server sends a JSON payload with a `<trl-custom-rest-json ... />` tag to a configured callback URL

---

## ▶️ Running the Server

```bash
npm start
npm run dev
```

You should see:

```
✅ Server is running on http://localhost:8000
```

