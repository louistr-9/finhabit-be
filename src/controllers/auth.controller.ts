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

}
