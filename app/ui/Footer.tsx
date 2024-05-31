import clsx from "clsx";
import Card from "./Card";

export default function Footer({
  className,
  children,
}: React.PropsWithChildren<{ className?: string }>) {
  return (
    <Card
      as="footer"
      className={clsx("text-gray-500 text-center justify-between", className)}
    >
      {children}

      <div className="flex justify-between">
        <span>© 2024 Siddhant Gupta</span>
        <a
          className="text-blue-500"
          target="_blank"
          href="https://github.com/guptasiddhant/azure-feature-flags"
        >
          GitHub
        </a>
      </div>
    </Card>
  );
}
