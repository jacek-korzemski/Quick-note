import { forwardRef } from "react";
import { InputWrapper, Label, StyledTextarea, HelperText } from "./styles";
import { TextareaProps } from "./types";

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  label,
  error,
  helperText,
  fullWidth = false,
  resize = 'vertical',
  id,
  ...props
}, ref) => {
  const inputId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <InputWrapper $fullWidth={fullWidth}>
      {label && <Label htmlFor={inputId}>{label}</Label>}
      <StyledTextarea
        ref={ref}
        id={inputId}
        $resize={resize}
        style={{ width: fullWidth ? '100%' : 'auto' }}
        {...props}
      />
      {(error || helperText) && (
        <HelperText $error={!!error}>{error || helperText}</HelperText>
      )}
    </InputWrapper>
  );
});

Textarea.displayName = 'Textarea';

export default Textarea;