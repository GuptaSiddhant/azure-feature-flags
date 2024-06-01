import { AppConfigurationClient } from "@azure/app-configuration";
import * as React from "react";

export default function useAzureClientActionState() {
  return React.useActionState(async (_prev: unknown, formData: FormData) => {
    const connectionString = formData.get("connectionString")?.toString();
    if (!connectionString) {
      return "No connectionString provided.";
    }

    if (
      !connectionString.includes("Endpoint=") ||
      !connectionString.includes("Secret=") ||
      !connectionString.includes("Id=")
    ) {
      return "The connectionString is not in correct format";
    }

    try {
      return new AppConfigurationClient(connectionString);
    } catch {
      return "An error occurred while connecting! Try again.";
    }
  }, undefined);
}
