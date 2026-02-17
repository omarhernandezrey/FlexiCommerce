import { Request, Response } from 'express';
import { UsersService } from './users.service.js';

export class UsersController {
  private service = new UsersService();

  getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await this.service.getById(req.user.id);
      res.json({ success: true, data: user });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error';
      res.status(500).json({ success: false, error: message });
    }
  };

  updateProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await this.service.update(req.user.id, req.body);
      res.json({ success: true, data: user });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al actualizar perfil';
      res.status(400).json({ success: false, error: message });
    }
  };

  getAll = async (_req: Request, res: Response): Promise<void> => {
    try {
      const users = await this.service.getAll();
      res.json({ success: true, data: users });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error';
      res.status(500).json({ success: false, error: message });
    }
  };
}
