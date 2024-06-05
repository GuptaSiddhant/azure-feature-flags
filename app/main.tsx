import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import useFeatureFlagServiceActionState from "./hooks/useFeatureFlagServiceActionState";
import Connect from "./Connect";
import App from "./App";
import { FFServiceContext } from "./contexts";
import { FeatureFlagService } from "../src";

function Main() {
  const [serviceOrError, action, isSubmitting] =
    useFeatureFlagServiceActionState();

  return (
    <>
      {serviceOrError instanceof FeatureFlagService ? (
        <FFServiceContext.Provider value={serviceOrError}>
          <App disconnectAction={action} />
        </FFServiceContext.Provider>
      ) : (
        <Connect
          connectAction={action}
          error={serviceOrError}
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
