import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import useAzureClientActionState from "./hooks/useAzureClientActionState";
import { AppConfigurationClient } from "@azure/app-configuration";
import Connect from "./Connect.tsx";
import App from "./App.tsx";
import { AzureClientContext } from "./contexts";

function Main() {
  const [clientOrError, action, isSubmitting] = useAzureClientActionState();

  return (
    <>
      {clientOrError instanceof AppConfigurationClient ? (
        <AzureClientContext.Provider value={clientOrError}>
          <App disconnectAction={action} />
        </AzureClientContext.Provider>
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
