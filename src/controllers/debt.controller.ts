import { Request, Response, NextFunction } from "express";
import { DebtService } from "../services/debt.service";

const debtService = new DebtService();

export class DebtController {

    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user.userId;
            const debt = await debtService.createDebt(userId, req.body);

            res.status(201).json({
                success: true,
                message: "Ghi nhận nợ thành công",
                data: debt
            });
        } catch (error) {
            next(error);
        }
    }

    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user.userId;
            const debts = await debtService.getDebts(userId);

            res.status(200).json({
                success: true,
                data: debts
            });
        } catch (error) {
            next(error);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user.userId;
            const debtId = req.params.id;

            await debtService.deleteDebt(userId, debtId);

            res.status(200).json({
                success: true,
                message: "Xóa nợ thành công"
            });
        } catch (error) {
            next(error);
        }
    }
}
