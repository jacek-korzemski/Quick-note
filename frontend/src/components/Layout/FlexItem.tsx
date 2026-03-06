import { StyledFlexItem } from "@/components/Layout/styles";
import { FlexItemProps } from "@/components/Layout/types";

export const FlexItem: React.FC<FlexItemProps> = ({ children, ...props }) => {
  return <StyledFlexItem {...props}>{children}</StyledFlexItem>;
};