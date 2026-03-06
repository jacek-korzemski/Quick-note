import { StyledButtonGroup } from "./styles";
import { ButtonGroupProps } from "./types";

const ButtonGroup: React.FC<ButtonGroupProps> = ({ children, attached = false }) => {
  return <StyledButtonGroup $attached={attached}>{children}</StyledButtonGroup>;
};

export default ButtonGroup;