interface StaggerProps {
  children: React.ReactNode;
  className?: string;
}

export default function Stagger({ children, className = "" }: StaggerProps) {
  return <div className={`flex flex-col gap-4 ${className}`}>{children}</div>;
}

export function StaggerItem({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const delayClass =
    delay === 1
      ? "reveal-delay-1"
      : delay === 2
        ? "reveal-delay-2"
        : delay === 3
          ? "reveal-delay-3"
          : "";

  return (
    <div className={`reveal ${delayClass} ${className}`}>{children}</div>
  );
}
