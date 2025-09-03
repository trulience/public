# Trulience Rest Endpoint sample code

This is a sample **Express.js server** that demonstrates how to manage user sessions, handle chat messages, and send custom data callbacks for integration with the Trulience platform.

---

## 🚀 Features

* **Session Management**

  * `LOGIN` → start a session
  * `LOGOUT` → end a session

* **Chat Handling**

  * `CHAT` → echo back user messages
  * Special command `/sendcustomdata` → triggers a callback (`/tslisten`)

* **Callback Support**

  * Server sends a JSON payload with a `<trl-custom-rest-json ... />` tag to a configured callback URL

---

## ▶️ Running the Server

```bash
npm start
npm dev
```

You should see:

```
✅ Server is running on http://localhost:8000
```

