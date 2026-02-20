import { Request, Response } from 'express';
import { AuthService } from './auth.service.js';

export class AuthController {
  private service = new AuthService();

  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.service.register(req.body);
      res.status(201).json({ 
        success: true, 
        data: {
          token: result.token,
          user: result.user
        }
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al registrar';
      res.status(400).json({ success: false, error: message });
    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.service.login(req.body);
      res.status(200).json({ 
        success: true, 
        data: {
          token: result.token,
          user: result.user
        }
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al iniciar sesión';
      res.status(401).json({ success: false, error: message });
    }
  };

  logout = async (_req: Request, res: Response): Promise<void> => {
    try {
      // Logout is handled client-side by removing token
      res.status(200).json({ success: true, message: 'Sesión cerrada correctamente' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al cerrar sesión';
      res.status(400).json({ success: false, error: message });
    }
  };

  getMe = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'No autenticado' });
        return;
      }
      
      const user = await this.service.getUserById(userId);
      if (!user) {
        res.status(404).json({ success: false, error: 'Usuario no encontrado' });
        return;
      }
      
      res.status(200).json({ success: true, data: user });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al obtener usuario';
      res.status(400).json({ success: false, error: message });
    }
  };

  refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'No autenticado' });
        return;
      }
      
      const result = await this.service.refreshToken(userId);
      res.status(200).json({ 
        success: true, 
        data: {
          token: result.token,
          user: result.user
        }
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al renovar token';
      res.status(401).json({ success: false, error: message });
    }
  };
}
