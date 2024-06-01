import { AppConfigurationClient } from "@azure/app-configuration";
import { createContext, use } from "react";

export const RerenderAppContext = createContext<
  React.DispatchWithoutAction | undefined
>(undefined);
export function useRerenderAppContext() {
  const context = use(RerenderAppContext);
  if (!context) throw new Error("RerenderAppContext Context");
  return context;
}

export const AzureClientContext = createContext<
  AppConfigurationClient | undefined
>(undefined);
export function useAzureClientContext() {
  const context = use(AzureClientContext);
  if (!context) throw new Error("Azure Context");
  return context;
}
