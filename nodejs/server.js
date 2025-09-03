const express = require("express");
const app = express();
app.use(express.json());

const PORT = 8000

// Store active sessions
const sessions = new Map();

app.get("/", (req, res) => {
  res.status(200).send(`
    ✅ Server is running!<br/>
    🌐 To make it accessible externally, please connect a tunneling service (e.g., ngrok).<br/>
    ⚙️ Then, set the {tunnel URL}/trulience in the Trulience dashboard to start using it.
  `);
});

app.post("/trulience", (req, res) => {
  try {
    const { action, sessionId, userId, message, authToken, callbackUrl } =
      req.body;

    if (!action || !sessionId) {
      return res.status(400).json({
        status: "ERROR",
        statusMessage: "Missing required fields: action and sessionId",
      });
    }

    console.log("Request Received:", req.body);

    switch (action) {
      case "LOGIN": {
        sessions.set(sessionId, {
          userId,
          authToken,
          callbackUrl,
          joinedAt: new Date(),
        });

        return res.json({
          sessionId,
          status: "OK",
          statusMessage: "Welcome! How can I help you today?",
        });
      }

      case "CHAT": {
        if (!sessions.has(sessionId)) {
          return res.status(401).json({
            sessionId,
            status: "ERROR",
            statusMessage: "Invalid or expired session",
          });
        }

        const reply = generateResponse(message, sessionId);

        return res.json({
          sessionId,
          reply,
          status: "OK",
          statusMessage: "Reply sent",
        });
      }

      case "LOGOUT": {
        sessions.delete(sessionId);

        return res.json({
          sessionId,
          status: "OK",
          statusMessage: "Goodbye!",
        });
      }

      default:
        return res.status(400).json({
          sessionId,
          status: "ERROR",
          statusMessage: `Unknown action: ${action}`,
        });
    }
  } catch (err) {
    console.error("Error handling request:", err);
    return res.status(500).json({
      status: "ERROR",
      statusMessage: "Internal server error",
    });
  }
});


function generateResponse(userMessage, sessionId) {
  const sessionDetails = sessions.get(sessionId);

  // Special command: trigger callback
  if (userMessage.trim().toLowerCase() === "/sendcustomdata") {
    sendCustomData(sessionDetails, sessionId);
    return "Custom data sending separately.";
  }

  // Default echo response
  return `I received your message: ${userMessage}. How else can I help?`;
}

function sendCustomData(sessionDetails, sessionId) {
  const url = sessionDetails.callbackUrl

  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sessionDetails.authToken}`,
    },
    body: JSON.stringify({
      sessionId,
      message: `<trl-custom-rest-json json='{"name":"ABC","id":123,"server":true}' />`,
    }),
  }).catch((err) => {
    console.error("Callback failed:", err);
  });
}


app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
