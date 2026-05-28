import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";
import { registerSchema, loginSchema } from "../validators/auth.validator";

const authService = new AuthService();

export class AuthController {

    async register(req: Request, res: Response, next: NextFunction) {
        try {
            const validatedData = registerSchema.parse(req.body);
            const user = await authService.register(
                validatedData.email,
                validatedData.name,
                validatedData.password
            );

            res.status(201).json({
                success: true,
                message: "Đăng ký thành công!",
                data: user,
            });
        } catch (error) {
            next(error);
        }
    }

    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const validatedData = loginSchema.parse(req.body);
            const result = await authService.login(validatedData.email, validatedData.password);

            res.status(200).json({
                success: true,
                message: "Đăng nhập thành công!",
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    async syncProfile(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, name, avatarUrl, initialBalance, monthlyBudget, telegramChatId, discordUserId, geminiApiKey } = req.body;
            
            // Lấy email từ token nếu đang gọi theo kiểu API User (chứ không phải Admin)
            const targetEmail = (req as any).user?.email || email;
            if (!targetEmail) {
                return res.status(400).json({ success: false, message: "Thiếu email" });
            }

            const PrismaClient = require('@prisma/client').PrismaClient;
            const prisma = new PrismaClient();
            
            const updateData: any = {};
            if (name !== undefined) updateData.name = name;
            if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl || null;
            if (initialBalance !== undefined) updateData.initialBalance = Number(initialBalance);
            if (monthlyBudget !== undefined) updateData.monthlyBudget = Number(monthlyBudget);
            
            if (telegramChatId !== undefined) updateData.telegramChatId = telegramChatId || null;
            if (discordUserId !== undefined) updateData.discordUserId = discordUserId || null;
            if (geminiApiKey !== undefined && geminiApiKey !== '***************************************') {
                updateData.geminiApiKey = geminiApiKey || null;
            }

            const updatedUser = await prisma.user.update({
                where: { email: targetEmail },
                data: updateData
            });

            res.status(200).json({
                success: true,
                message: "Đồng bộ Profile Backend thành công!",
                data: updatedUser
            });
        } catch (error) {
            next(error);
        }
    }

}
