import { forwardRef } from 'react';
import { RadioWrapper, RadioContainer, HiddenInput, RadioCircle, RadioDot, RadioLabel } from './styles';
import { RadioProps } from './types';

const Radio = forwardRef<HTMLInputElement, RadioProps>(({
  label,
  ...props
}, ref) => {
  return (
    <RadioWrapper>
      <RadioContainer>
        <HiddenInput ref={ref} type="radio" {...props} />
        <RadioCircle>
          <RadioDot />
        </RadioCircle>
      </RadioContainer>
      {label && <RadioLabel>{label}</RadioLabel>}
    </RadioWrapper>
  );
});

Radio.displayName = 'Radio';

export default Radio;