import clsx from "clsx";

export default function Link(props: React.ComponentPropsWithRef<"a">) {
  return (
    <a
      {...props}
      className={clsx(
        "px-4 py-2 border rounded cursor-pointer flex items-center gap-2 border-gray-500",
        "hover:bg-gray-200",
        props.className
      )}
    >
      {props.children}
    </a>
  );
}
