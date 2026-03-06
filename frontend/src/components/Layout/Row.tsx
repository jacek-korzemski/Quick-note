import { StyledRow } from "@/components/Layout/styles";
import { RowProps } from "@/components/Layout/types";

export const Row: React.FC<RowProps> = ({ children, ...props }) => {
  return <StyledRow {...props}>{children}</StyledRow>;
};