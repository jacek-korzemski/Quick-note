import AuthModal from "@/components/AuthModal/AuthModal";
import { Button } from "@/components/Button/Button";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import styled from "styled-components";

type AuthTab = 'login' | 'register';

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const UserName = styled.span`
  font-size: ${({ theme }) => theme.fontSize.md};
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-transform: capitalize;
`;

const UserEmail = styled.span`
  font-size: ${({ theme }) => theme.fontSize.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

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
      <UserInfo>
        <div>
          <UserName>{user.username}</UserName>
          <UserEmail>{user.email}</UserEmail>
        </div>
        <Button variant="ghost" size="sm" fullWidth onClick={() => logout()}>
          Wyloguj
        </Button>
      </UserInfo>
    );
  }

  return (
    <>
      <div style={{ display: 'flex', gap: '8px' }}>
        <Button variant="tertiary" onClick={() => openModal('login')} fullWidth>Zaloguj</Button>
        <Button variant="tertiary" onClick={() => openModal('register')} fullWidth>Rejestracja</Button>
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
