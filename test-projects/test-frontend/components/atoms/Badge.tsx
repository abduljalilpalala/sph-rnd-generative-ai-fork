interface BadgeProps {
  variant: "success" | "info" | "warning" | "danger";
  children: React.ReactNode;
}

export const Badge = ({ variant, children }: BadgeProps) => {
  const variantStyles = {
    success: "bg-green-100 text-green-800 border-green-300",
    info: "bg-blue-100 text-blue-800 border-blue-300",
    warning: "bg-yellow-100 text-yellow-800 border-yellow-300",
    danger: "bg-red-100 text-red-800 border-red-300",
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${variantStyles[variant]}`}
    >
      {children}
    </span>
  );
};
