import { LayoutContainer, MainContent } from "./styles";
import { SidebarLayoutProps } from "./types";

const SidebarLayout: React.FC<SidebarLayoutProps> = ({
  children,
  leftSidebar,
  rightSidebar,
}) => {
  return (
    <LayoutContainer>
      {leftSidebar}
      <MainContent>{children}</MainContent>
      {rightSidebar}
    </LayoutContainer>
  );
};

export default SidebarLayout;