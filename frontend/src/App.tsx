import { ThemeProvider } from "styled-components";
import Sidebar from "./components/Sidebar/Sidebar";
import SidebarLayout from "./components/Sidebar/SidebarLayout";
import { SnackbarProvider } from "./components/Snackbar";
import { GlobalStyles } from "./styles/GlobalStyles";
import { theme } from "./styles/theme";
import { AuthProvider } from "@/context/AuthContext";
import { CategoriesProvider } from "@/context/CategoriesContext";
import { NotesProvider } from "@/context/NotesContext";
import SidebarAuth from "@/components/SidebarAuth/SidebarAuth";
import SidebarActions from "@/components/SidebarActions/SidebarActions";
import NotesContent from "@/components/NotesContent/NotesContent";

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles theme={theme} />
      <SnackbarProvider>
        <AuthProvider>
          <CategoriesProvider>
          <NotesProvider>
            <SidebarLayout
              leftSidebar={
                <Sidebar
                  position="left"
                  defaultWidth={260}
                  minWidth={200}
                  maxWidth={400}
                  collapsible
                  resizable
                  header={<span style={{ fontWeight: 600 }}>Notepad</span>}
                >
                  <SidebarActions />
                  <SidebarAuth />
                </Sidebar>
              }
            >
              <NotesContent />
            </SidebarLayout>
          </NotesProvider>
          </CategoriesProvider>
        </AuthProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
};

export default App;
