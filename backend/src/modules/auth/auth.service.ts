import bcrypt from 'bcrypt';
import jwt from 'jwt-simple';
import prisma from '../../database/prisma.js';
import { config } from '../../config/index.js';

interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface LoginInput {
  email: string;
  password: string;
}

interface AuthResult {
  token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

export class AuthService {
  async register(data: RegisterInput): Promise<AuthResult> {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      throw new Error('El email ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
    });

    const token = jwt.encode(
      { id: user.id, email: user.email, role: user.role },
      config.jwt.secret
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  async login(data: LoginInput): Promise<AuthResult> {
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) {
      throw new Error('Credenciales inválidas');
    }

    const isValid = await bcrypt.compare(data.password, user.password);
    if (!isValid) {
      throw new Error('Credenciales inválidas');
    }

    const token = jwt.encode(
      { id: user.id, email: user.email, role: user.role },
      config.jwt.secret
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    return user;
  }

  async refreshToken(userId: string): Promise<AuthResult> {
    const user = await this.getUserById(userId);

    const token = jwt.encode(
      { id: user.id, email: user.email, role: user.role },
      config.jwt.secret
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }
}
