import { useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
  callback();

  window.addEventListener("hashchange", callback);

  return () => {
    window.removeEventListener("hashchange", callback);
  };
}

function getSnapshot() {
  return window.location.hash.replace("#", "");
}

function getServerSnapshot() {
  return undefined;
}

export default function useHashChange(): string | undefined {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
