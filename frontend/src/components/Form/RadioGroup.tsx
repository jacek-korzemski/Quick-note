import React from "react";
import { RadioGroupWrapper } from "./styles";
import { RadioGroupProps, RadioProps } from "./types";

const RadioGroup: React.FC<RadioGroupProps> = ({
  children,
  name,
  value,
  onChange,
  direction = 'vertical',
}) => {
  return (
    <RadioGroupWrapper $direction={direction}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement<RadioProps>(child)) {
          return React.cloneElement(child, {
            name,
            checked: child.props.value === value,
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
              onChange?.(e.target.value);
              child.props.onChange?.(e);
            },
          });
        }
        return child;
      })}
    </RadioGroupWrapper>
  );
};

export default RadioGroup;