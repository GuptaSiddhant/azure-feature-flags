import clsx from "clsx";

export default function Button(props: React.ComponentPropsWithRef<"button">) {
  return (
    <button
      {...props}
      className={clsx(
        "px-4 py-2 border rounded cursor-pointer flex items-center gap-2 border-gray-500",
        props.disabled ? "text-gray-500 bg-gray-200" : "hover:bg-gray-200",
        props.className
      )}
    >
      {props.children}
    </button>
  );
}
