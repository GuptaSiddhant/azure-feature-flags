import clsx from "clsx";
import Card from "./Card";

export default function Header({
  className,
  children,
}: React.PropsWithChildren<{ className?: string }>) {
  return (
    <Card as="header" className={clsx(className)}>
      <div className="flex flex-wrap gap-x-4 gap-y-2 items-center justify-between">
        <span className="font-bold ">Azure Feature Flags</span>
        <ul className="flex gap-2">
          <li>
            <a
              href="https://www.npmjs.com/package/azure-feature-flags"
              target="_blank"
            >
              <img
                alt="NPM Version"
                src="https://img.shields.io/npm/v/azure-feature-flags"
              />
            </a>
          </li>
          <li>
            <a href="https://jsr.io/@gs/azure-feature-flags" target="_blank">
              <img
                src="https://jsr.io/badges/@gs/azure-feature-flags"
                alt="Azure Feature Flags on JSR"
              />
            </a>
          </li>
        </ul>
      </div>

      {children}
    </Card>
  );
}
