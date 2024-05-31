import clsx from "clsx";

type ReactTag = keyof React.JSX.IntrinsicElements;

export type CardProps<T extends ReactTag> = {
  children: React.ReactNode;
  as?: T;
} & React.JSX.IntrinsicElements[T];

// React.createElement

export default function Card<T extends ReactTag = "div">({
  children,
  as,
  className,
  ...rest
}: CardProps<T>) {
  const Component: any = as ?? "div";

  return (
    <Component
      {...rest}
      className={clsx(
        "flex flex-col gap-4 shadow-lg rounded-lg p-4 border-gray-200 border ",
        className
      )}
    >
      {children}
    </Component>
  );
}
