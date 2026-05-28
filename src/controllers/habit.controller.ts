import { Request, Response, NextFunction } from "express";
import { HabitService } from "../services/habit.service";

const habitService = new HabitService();

export class HabitController {

    // 2. Tạo Thói quen
    async createHabit(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user.userId;
            const habit = await habitService.createHabit(userId, req.body);

            res.status(201).json({
                success: true,
                message: "Tạo thói quen thành công",
                data: habit
            });
        } catch (error) {
            next(error);
        }
    }

    // 3. Lấy danh sách Thói quen
    async getAllHabits(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user.userId;
            const habits = await habitService.getHabits(userId);

            res.status(200).json({
                success: true,
                data: habits
            });
        } catch (error) {
            next(error);
        }
    }

    // 4. Xóa Thói quen
    async deleteHabit(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user.userId;
            const habitId = req.params.id;

            await habitService.deleteHabit(userId, habitId);

            res.status(200).json({
                success: true,
                message: "Xóa thói quen thành công"
            });
        } catch (error) {
            next(error);
        }
    }

    // 5. Check-in Thói quen
    async toggleCheckIn(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user.userId;
            const habitId = req.params.id;
            const { date } = req.body;

            const result = await habitService.toggleCheckIn(userId, habitId, date);

            res.status(200).json({
                success: true,
                ...result
            });
        } catch (error) {
            next(error);
        }
    }
}
