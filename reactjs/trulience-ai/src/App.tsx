import React from "react";
import Agent from "./Agent/Agent";
import { AvatarProvider } from "./Agent/context/AvatarContext";

function App() {
  return (
    <AvatarProvider>
      <Agent />
    </AvatarProvider>
  );
}

export default App;
