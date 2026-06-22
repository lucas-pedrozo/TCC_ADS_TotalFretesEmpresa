type AdminFieldErrorProps = {
  message?: string;
};

export function AdminFieldError({ message }: AdminFieldErrorProps) {
  if (!message) return null;
  return <p className="text-sm text-destructive">{message}</p>;
}

export function adminFieldInputClass(hasError?: boolean) {
  return hasError ? "border-destructive focus-visible:ring-destructive/30" : undefined;
}
