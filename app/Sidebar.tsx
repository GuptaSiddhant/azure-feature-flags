import clsx from "clsx";
import Card from "./ui/Card.tsx";
import Link from "./ui/Link.tsx";
import useHashChange from "./hooks/useHashChange.ts";
import { FeatureFlag } from "../src/types.ts";
import { useRerenderAppContext } from "./contexts.ts";

export default function SideBar({
  featureFlags,
}: {
  featureFlags: FeatureFlag[];
}) {
  const flagId = useHashChange();
  const refresh = useRerenderAppContext();

  return (
    <Card
      as="aside"
      className="flex flex-col gap-4 col-[1] md:flex-1 max-h-[200px] md:max-h-full justify-start overflow-y-scroll"
    >
      <div className="flex gap-2 justify-between">
        {/* <a className="cursor-pointer" href={`#${NEW_FLAG_HASH}`}>
          + Add new
        </a> */}
        <button type="button" className="cursor-pointer" onClick={refresh}>
          Refresh
        </button>
      </div>

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
                [{"conditions" in flag ? "C" : "V"}]{" "}
                {flag.displayName ?? flag.id}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}
