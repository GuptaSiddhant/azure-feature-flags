import clsx from "clsx";

export default function Input({
  label,
  helpText,
  className,
  ...props
}: React.ComponentPropsWithRef<"input"> & {
  label: string;
  helpText?: string;
}) {
  return (
    <label className="flex flex-col">
      {label}
      <input
        {...props}
        className={clsx(
          className,
          "w-full rounded shadow-inner border-gray-400 p-2"
        )}
      />
      {helpText ? <small className="text-gray-500">{helpText}</small> : null}
    </label>
  );
}
