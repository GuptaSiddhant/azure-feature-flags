import { useEffect, useState } from "react";

export default function useHashChange(): string {
  const [hash, setHash] = useState("");

  useEffect(() => {
    const handleChange = () => {
      setHash(window.location.hash);
    };

    window.addEventListener("hashchange", handleChange);

    return () => {
      window.removeEventListener("hashchange", handleChange);
    };
  });

  return hash.replace("#", "");
}
