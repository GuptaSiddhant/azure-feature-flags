import clsx from "clsx";
import Card from "./ui/Card";
import Link from "./ui/Link";
import useHashChange from "./hooks/useHashChange";
import type { FeatureFlag } from "../src/types";

export default function SideBar({
  featureFlags,
}: {
  featureFlags: FeatureFlag[];
}) {
  const flagId = useHashChange();

  return (
    <Card
      as="aside"
      className="flex flex-col gap-4 col-[1] md:flex-1 max-h-[200px] md:max-h-full justify-start overflow-y-scroll"
    >
      <ul className="flex flex-col gap-2">
        {featureFlags.map((flag) => (
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
                [{"variants" in flag ? "V" : "F"}] {flag.displayName ?? flag.id}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}
