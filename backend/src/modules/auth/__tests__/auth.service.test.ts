import { AuthService } from '../auth.service';

// Mock de Prisma para evitar conexión real a BD
jest.mock('../../../database/prisma', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

// Mock de bcrypt
jest.mock('bcrypt', () => ({
  __esModule: true,
  default: {
    hash: jest.fn().mockResolvedValue('hashed-password'),
    compare: jest.fn(),
  },
  hash: jest.fn().mockResolvedValue('hashed-password'),
  compare: jest.fn(),
}));

// Mock de jwt-simple
jest.mock('jwt-simple', () => ({
  __esModule: true,
  default: {
    encode: jest.fn().mockReturnValue('mocked-jwt-token'),
  },
  encode: jest.fn().mockReturnValue('mocked-jwt-token'),
}));

import prisma from '../../../database/prisma';
import bcrypt from 'bcrypt';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerData = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Juan',
      lastName: 'García',
    };

    it('lanza error si el email ya está registrado', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'existing-user' });

      await expect(authService.register(registerData)).rejects.toThrow(
        'El email ya está registrado'
      );
    });

    it('hashea el password antes de guardar', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (mockPrisma.user.create as jest.Mock).mockResolvedValue({
        id: 'new-user',
        email: registerData.email,
        firstName: registerData.firstName,
        lastName: registerData.lastName,
        role: 'CUSTOMER',
        createdAt: new Date(),
      });

      await authService.register(registerData);

      expect(mockBcrypt.hash).toHaveBeenCalledWith(registerData.password, 10);
    });

    it('retorna token y datos del usuario (sin password)', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (mockPrisma.user.create as jest.Mock).mockResolvedValue({
        id: 'new-user',
        email: registerData.email,
        firstName: registerData.firstName,
        lastName: registerData.lastName,
        role: 'CUSTOMER',
        createdAt: new Date(),
      });

      const result = await authService.register(registerData);

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('user');
      expect(result.user).not.toHaveProperty('password');
      expect(result.token).toBe('mocked-jwt-token');
    });
  });

  describe('login', () => {
    const loginData = { email: 'test@example.com', password: 'password123' };

    it('lanza error si el usuario no existe', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(authService.login(loginData)).rejects.toThrow('Credenciales inválidas');
    });

    it('lanza error si el password es incorrecto', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-1',
        email: loginData.email,
        password: 'hashed-pass',
        role: 'CUSTOMER',
      });
      (mockBcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(authService.login(loginData)).rejects.toThrow('Credenciales inválidas');
    });

    it('retorna token y usuario con credenciales correctas', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-1',
        email: loginData.email,
        firstName: 'Juan',
        lastName: 'García',
        password: 'hashed-pass',
        role: 'CUSTOMER',
      });
      (mockBcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await authService.login(loginData);

      expect(result.token).toBe('mocked-jwt-token');
      expect(result.user.email).toBe(loginData.email);
      expect(result.user).not.toHaveProperty('password');
    });
  });
});
