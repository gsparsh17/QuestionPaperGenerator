import { Buffer } from "buffer";

// Polyfill for 'global'
if (typeof global === "undefined") {
  window.global = window;
}

// Polyfill for 'Buffer'
if (typeof window.Buffer === "undefined") {
  window.Buffer = Buffer;
}
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx"
import "./index.css"
import ContextProvider from "./context/Context.jsx"
import { GoogleOAuthProvider } from "@react-oauth/google";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId="1081491165931-1l2iao3uq3dn9vs4q7u3tve0vfk22smv.apps.googleusercontent.com">
    <ContextProvider>
      <App />
    </ContextProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
