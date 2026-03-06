import { StyledIconButton } from "./styles";
import { IconButtonProps } from "./types";

const IconButton: React.FC<IconButtonProps> = ({
  children,
  size = 'md',
  variant = 'default',
  ...props
}) => {
  return (
    <StyledIconButton $size={size} $variant={variant} {...props}>
      {children}
    </StyledIconButton>
  );
};

export default IconButton;