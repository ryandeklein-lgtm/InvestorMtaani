import React from "react";
import ReactDOM from "react-dom/client";

import "./index.css";

// Global Theme
import "./theme/Global.css";
import "./theme/Layout.css";
import "./theme/Buttons.css";
import "./theme/Cards.css";
import "./theme/Forms.css";
import "./theme/Tables.css";
import "./theme/Dashboard.css";

import App from "./App";
import { AuthProvider } from "./contexts/AuthContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
