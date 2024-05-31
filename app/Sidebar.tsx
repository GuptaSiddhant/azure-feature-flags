import { AppConfigurationClient } from "@azure/app-configuration";
import clsx from "clsx";
import { Suspense, use } from "react";
import { getFeatureFlagsList } from "../src/service.ts";
import type { FeatureFlag } from "../src/types.ts";
import Button from "./ui/Button";
import Card from "./ui/Card";
import Link from "./ui/Link.tsx";
import useHashChange from "./hooks/useHashChange.ts";

export default function SideBar({
  client,
}: {
  client: AppConfigurationClient;
}) {
  return (
    <Card
      as="aside"
      className="flex flex-col gap-4 col-[1] md:flex-1 max-h-[200px] md:max-h-full justify-start overflow-y-scroll"
    >
      <Suspense
        fallback={
          <Button className="w-full" disabled>
            Loading...
          </Button>
        }
      >
        <List flagsPromise={getFeatureFlagsList(client)} />
      </Suspense>
    </Card>
  );
}

function List({ flagsPromise }: { flagsPromise: Promise<FeatureFlag[]> }) {
  const flags = use(flagsPromise);
  const flagId = useHashChange();

  return (
    <ul className="flex flex-col gap-2">
      {flags.map((flag) => (
        <li key={flag.id} className="flex">
          <Link
            href={`#${flag.id}`}
            className={clsx("w-full", flagId === flag.id ? "font-bold" : "")}
          >
            <div
              className={clsx(
                "w-3 h-3 rounded-full",
                flag.enabled ? "bg-green-500" : "bg-red-500"
              )}
            />
            <span>
              [{"conditions" in flag ? "C" : "V"}] {flag.displayName ?? flag.id}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
