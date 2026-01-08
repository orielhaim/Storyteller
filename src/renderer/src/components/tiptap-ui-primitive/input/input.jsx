import { cn } from "@/lib/tiptap-utils"
import "@/components/tiptap-ui-primitive/input/input.scss"

function Input({
  className,
  type,
  ...props
}) {
  return (<input type={type} className={cn("tiptap-input", className)} {...props} />);
}

function InputGroup({
  className,
  children,
  ...props
}) {
  return (
    <div className={cn("tiptap-input-group", className)} {...props}>
      {children}
    </div>
  );
}

export { Input, InputGroup }
