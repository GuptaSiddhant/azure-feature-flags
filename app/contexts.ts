import { createContext, use } from "react";
import { FeatureFlagService } from "../src";

export const RerenderAppContext = createContext<
  React.DispatchWithoutAction | undefined
>(undefined);
export function useRerenderAppContext() {
  const context = use(RerenderAppContext);
  if (!context) throw new Error("RerenderAppContext Context");
  return context;
}

export const FFServiceContext = createContext<FeatureFlagService | undefined>(
  undefined
);
export function useFeatureFlagService() {
  const context = use(FFServiceContext);
  if (!context) throw new Error("FFS");
  return context;
}
