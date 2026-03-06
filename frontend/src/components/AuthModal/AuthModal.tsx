import { useState, useEffect, type FormEvent } from 'react';
import Modal from '@/components/Modal/Modal';
import Input from '@/components/Form/Input';
import { Button } from '@/components/Button/Button';
import { useAuth } from '@/context/AuthContext';
import { AuthForm, TabBar, Tab, ErrorMessage } from './styles';

type AuthTab = 'login' | 'register';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: AuthTab;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialTab = 'login' }) => {
  const { login, register } = useAuth();
  const [tab, setTab] = useState<AuthTab>(initialTab);

  useEffect(() => {
    if (isOpen) setTab(initialTab);
  }, [isOpen, initialTab]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setUsername('');
    setError('');
  };

  const switchTab = (newTab: AuthTab) => {
    setTab(newTab);
    resetForm();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (tab === 'login') {
        await login(email, password);
      } else {
        await register(username, email, password);
      }
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wystąpił nieoczekiwany błąd.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={tab === 'login' ? 'Logowanie' : 'Rejestracja'}
      maxWidth="420px"
      width="420px"
    >
      <TabBar>
        <Tab $active={tab === 'login'} onClick={() => switchTab('login')}>
          Logowanie
        </Tab>
        <Tab $active={tab === 'register'} onClick={() => switchTab('register')}>
          Rejestracja
        </Tab>
      </TabBar>

      <AuthForm onSubmit={handleSubmit}>
        {error && <ErrorMessage>{error}</ErrorMessage>}

        {tab === 'register' && (
          <Input
            label="Nazwa użytkownika"
            placeholder="min. 3 znaki"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            fullWidth
            autoComplete="username"
          />
        )}

        <Input
          label="Email"
          type="email"
          placeholder="twoj@email.pl"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          autoComplete="email"
        />

        <Input
          label="Hasło"
          type="password"
          placeholder="min. 6 znaków"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
        />

        <Button
          type="submit"
          variant="primary"
          fullWidth
          loading={loading}
        >
          {tab === 'login' ? 'Zaloguj się' : 'Zarejestruj się'}
        </Button>
      </AuthForm>
    </Modal>
  );
};

export default AuthModal;
