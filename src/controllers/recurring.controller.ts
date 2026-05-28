import { Request, Response, NextFunction } from "express";
import { RecurringService } from "../services/recurring.service";

const recurringService = new RecurringService();

export class RecurringController {

    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user.userId;
            const recurring = await recurringService.createRecurring(userId, req.body);

            res.status(201).json({
                success: true,
                message: "Tạo giao dịch lặp lại thành công",
                data: recurring
            });
        } catch (error) {
            next(error);
        }
    }

    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user.userId;
            const recurrings = await recurringService.getRecurrings(userId);

            res.status(200).json({
                success: true,
                data: recurrings
            });
        } catch (error) {
            next(error);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user.userId;
            const id = req.params.id;

            await recurringService.deleteRecurring(userId, id);

            res.status(200).json({
                success: true,
                message: "Xóa thành công"
            });
        } catch (error) {
            next(error);
        }
    }
}
