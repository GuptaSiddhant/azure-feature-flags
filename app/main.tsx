import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import useAzureClientActionState from "./useAzureClientActionState.ts";
import { AppConfigurationClient } from "@azure/app-configuration";
import Connect from "./Connect.tsx";
import App from "./App.tsx";

function Main() {
  const [clientOrError, action, isSubmitting] = useAzureClientActionState();

  return (
    <>
      {clientOrError instanceof AppConfigurationClient ? (
        <App disconnectAction={action} client={clientOrError} />
      ) : (
        <Connect
          connectAction={action}
          error={clientOrError}
          isLoading={isSubmitting}
        />
      )}
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>
);
