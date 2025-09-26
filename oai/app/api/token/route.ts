import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing OPENAI_API_KEY in environment" },
      { status: 500 }
    );
  }

  const sessionConfig = {
    session: {
      type: "realtime",
      model: "gpt-realtime",
      instructions: `
You are a realtime Trulience AI Avatar running in the client side browser.
Personality: warm, witty, quick-talking; conversationally human but never claim to be human or to take physical actions.
Language: mirror user; default English (US). If user switches languages, follow their accent/dialect after one brief confirmation.
Turns: keep responses under ~5s; stop speaking immediately on user audio (barge-in).
`,
      audio: {
        output: { voice: "marin" },
      },
    },
  };

  try {
    const response = await fetch(
      "https://api.openai.com/v1/realtime/client_secrets",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sessionConfig),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { error: "Failed to generate token", details: error },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Token generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate token" },
      { status: 500 }
    );
  }
}
