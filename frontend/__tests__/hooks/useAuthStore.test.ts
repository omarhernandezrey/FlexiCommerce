import { act } from '@testing-library/react';
import { useAuthStore } from '@/store/auth';

const mockUser = {
  id: 'user-1',
  email: 'test@flexicommerce.com',
  firstName: 'Juan',
  lastName: 'García',
  role: 'customer' as const,
};

beforeEach(() => {
  act(() => {
    useAuthStore.setState({ user: null, isAuthenticated: false, token: null });
  });
});

describe('useAuthStore', () => {
  describe('estado inicial', () => {
    it('inicia sin usuario autenticado', () => {
      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
    });
  });

  describe('login', () => {
    it('establece el usuario y isAuthenticated en true', () => {
      act(() => {
        useAuthStore.getState().login(mockUser, 'test-token-123');
      });
      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.user).toEqual(mockUser);
      expect(state.token).toBe('test-token-123');
    });

    it('funciona sin token (token queda en null)', () => {
      act(() => {
        useAuthStore.getState().login(mockUser);
      });
      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.token).toBeNull();
    });
  });

  describe('logout', () => {
    it('limpia el usuario y el token', () => {
      act(() => {
        useAuthStore.getState().login(mockUser, 'test-token-123');
        useAuthStore.getState().logout();
      });
      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
    });
  });

  describe('updateUser', () => {
    it('actualiza campos del usuario sin reemplazar todo', () => {
      act(() => {
        useAuthStore.getState().login(mockUser, 'token-abc');
        useAuthStore.getState().updateUser({ firstName: 'Carlos' });
      });
      const { user } = useAuthStore.getState();
      expect(user?.firstName).toBe('Carlos');
      expect(user?.email).toBe('test@flexicommerce.com');
    });

    it('no hace nada si no hay usuario logueado', () => {
      act(() => {
        useAuthStore.getState().updateUser({ firstName: 'Carlos' });
      });
      expect(useAuthStore.getState().user).toBeNull();
    });
  });

  describe('setToken', () => {
    it('actualiza el token sin modificar el usuario', () => {
      act(() => {
        useAuthStore.getState().login(mockUser, 'token-viejo');
        useAuthStore.getState().setToken('token-nuevo');
      });
      expect(useAuthStore.getState().token).toBe('token-nuevo');
      expect(useAuthStore.getState().user).toEqual(mockUser);
    });
  });
});
