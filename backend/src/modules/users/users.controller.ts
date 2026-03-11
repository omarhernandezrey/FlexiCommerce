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
      const { firstName, lastName, email, phone } = req.body;
      const user = await this.service.update(req.user.id, { firstName, lastName, email, phone });
      res.json({ success: true, data: user });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al actualizar perfil';
      res.status(400).json({ success: false, error: message });
    }
  };

  changePassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        res.status(400).json({ success: false, error: 'Se requieren contraseña actual y nueva' });
        return;
      }
      const result = await this.service.changePassword(req.user.id, currentPassword, newPassword);
      res.json({ success: true, data: result });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al cambiar contraseña';
      res.status(400).json({ success: false, error: message });
    }
  };

  updateAvatar = async (req: Request, res: Response): Promise<void> => {
    try {
      const { avatar } = req.body;
      if (!avatar || typeof avatar !== 'string' || !avatar.startsWith('data:image/')) {
        res.status(400).json({ success: false, error: 'Imagen inválida' });
        return;
      }
      // Limit: ~500KB base64 (~375KB raw image)
      if (avatar.length > 600000) {
        res.status(400).json({ success: false, error: 'La imagen es demasiado grande. Máximo 400KB' });
        return;
      }
      const user = await this.service.updateAvatar(req.user.id, avatar);
      res.json({ success: true, data: user, avatarUrl: avatar });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al actualizar avatar';
      res.status(500).json({ success: false, error: message });
    }
  };

  getStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const stats = await this.service.getStats(req.user.id);
      res.json({ success: true, data: stats });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al obtener estadísticas';
      res.status(500).json({ success: false, error: message });
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

  // ── Addresses ──────────────────────────────────────────────────────────────

  getAddresses = async (req: Request, res: Response): Promise<void> => {
    try {
      const addresses = await this.service.getAddresses(req.user.id);
      res.json({ success: true, data: addresses });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al obtener direcciones';
      res.status(500).json({ success: false, error: message });
    }
  };

  createAddress = async (req: Request, res: Response): Promise<void> => {
    try {
      const address = await this.service.createAddress(req.user.id, req.body);
      res.status(201).json({ success: true, data: address });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al crear dirección';
      res.status(400).json({ success: false, error: message });
    }
  };

  updateAddress = async (req: Request, res: Response): Promise<void> => {
    try {
      const address = await this.service.updateAddress(req.user.id, req.params.id, req.body);
      res.json({ success: true, data: address });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al actualizar dirección';
      res.status(400).json({ success: false, error: message });
    }
  };

  deleteAddress = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.service.deleteAddress(req.user.id, req.params.id);
      res.json({ success: true, data: null });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al eliminar dirección';
      res.status(400).json({ success: false, error: message });
    }
  };

  setDefaultAddress = async (req: Request, res: Response): Promise<void> => {
    try {
      const address = await this.service.setDefaultAddress(req.user.id, req.params.id);
      res.json({ success: true, data: address });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al establecer dirección predeterminada';
      res.status(400).json({ success: false, error: message });
    }
  };
}
