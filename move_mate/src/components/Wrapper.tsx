import type { PropsWithChildren } from "react";

type WrapperProps = PropsWithChildren<{
  className?: string;
}>;

function Wrapper({ children, className = "" }: WrapperProps) {
  return <div className={className}>{children}</div>;
}

export default Wrapper;
