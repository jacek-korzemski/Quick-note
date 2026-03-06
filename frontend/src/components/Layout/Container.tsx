import { StyledContainer } from "./styles";
import { ContainerProps } from "./types";

const Container: React.FC<ContainerProps> = ({ children, center = true, ...props }) => {
  return <StyledContainer center={center} {...props}>{children}</StyledContainer>;
};

export default Container;