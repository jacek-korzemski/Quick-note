import { forwardRef } from 'react';
import { SwitchWrapper, SwitchLabel, SwitchContainer, HiddenInput, SwitchTrack, SwitchThumb } from './styles';
import { SwitchProps } from './types';

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(({
  label,
  labelPosition = 'right',
  ...props
}, ref) => {
  return (
    <SwitchWrapper $labelPosition={labelPosition}>
      {label && <SwitchLabel>{label}</SwitchLabel>}
      <SwitchContainer>
        <HiddenInput ref={ref} type="checkbox" {...props} />
        <SwitchTrack>
          <SwitchThumb />
        </SwitchTrack>
      </SwitchContainer>
    </SwitchWrapper>
  );
});

Switch.displayName = 'Switch';