import AuthModal from "@/components/AuthModal/AuthModal";
import { Button } from "@/components/Button/Button";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";

type AuthTab = 'login' | 'register';

const SidebarAuth: React.FC = () => {
  const { user, logout } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState<AuthTab>('login');

  const openModal = (tab: AuthTab) => {
    setAuthTab(tab);
    setModalOpen(true);
  };

  if (user) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <Button variant="tertiary" onClick={() => logout()}>
          Wyloguj
        </Button>
      </div>
    );
  }

  return (
    <>
      <div style={{ display: 'flex', gap: '8px' }}>
        <Button variant="tertiary" onClick={() => openModal('login')} fullWidth>Sign In</Button>
        <Button variant="tertiary" onClick={() => openModal('register')} fullWidth>Register</Button>
      </div>
      <AuthModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialTab={authTab}
      />
    </>
  );
};

export default SidebarAuth;