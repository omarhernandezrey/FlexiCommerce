// Mock AsyncStorage before imports
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

import { useAuthStore } from '../../store/auth';

const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  firstName: 'Juan',
  lastName: 'García',
  role: 'customer' as const,
};

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, token: null, isAuthenticated: false });
  });

  describe('estado inicial', () => {
    it('no está autenticado por defecto', () => {
      const { isAuthenticated, user, token } = useAuthStore.getState();
      expect(isAuthenticated).toBe(false);
      expect(user).toBeNull();
      expect(token).toBeNull();
    });
  });

  describe('setAuth', () => {
    it('establece el usuario y token correctamente', () => {
      useAuthStore.getState().setAuth(mockUser, 'jwt-token-123');
      const { user, token, isAuthenticated } = useAuthStore.getState();
      expect(isAuthenticated).toBe(true);
      expect(user).toEqual(mockUser);
      expect(token).toBe('jwt-token-123');
    });
  });

  describe('logout', () => {
    it('limpia el estado de autenticación', () => {
      useAuthStore.getState().setAuth(mockUser, 'jwt-token-123');
      useAuthStore.getState().logout();
      const { user, token, isAuthenticated } = useAuthStore.getState();
      expect(isAuthenticated).toBe(false);
      expect(user).toBeNull();
      expect(token).toBeNull();
    });
  });

  describe('updateUser', () => {
    it('actualiza los campos del usuario', () => {
      useAuthStore.getState().setAuth(mockUser, 'jwt-token-123');
      useAuthStore.getState().updateUser({ firstName: 'Carlos' });
      const { user } = useAuthStore.getState();
      expect(user?.firstName).toBe('Carlos');
      expect(user?.email).toBe('test@example.com'); // no cambia
    });

    it('no hace nada si no hay usuario', () => {
      useAuthStore.getState().updateUser({ firstName: 'Carlos' });
      const { user } = useAuthStore.getState();
      expect(user).toBeNull();
    });
  });
});
