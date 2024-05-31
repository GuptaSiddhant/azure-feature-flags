import clsx from "clsx";

export default function Textarea({
  label,
  helpText,
  className,
  ...props
}: React.ComponentPropsWithRef<"textarea"> & {
  label: string;
  helpText?: string;
}) {
  return (
    <label className="flex flex-col">
      {label}
      <textarea
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
