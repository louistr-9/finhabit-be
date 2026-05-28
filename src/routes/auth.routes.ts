import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();
const authController = new AuthController();

router.post("/register", (req, res, next) => authController.register(req, res, next));
router.get("/me", authenticate, async (req, res) => {
    const PrismaClient = require('@prisma/client').PrismaClient;
    const prisma = new PrismaClient();
    const user = await prisma.user.findUnique({
        where: { id: (req as any).user.userId }
    });
    if (!user) return res.status(404).json({ message: "Không tìm thấy user" });
    const { password, ...userWithoutPassword } = user;
    res.json({
        message: "Bảo vệ API thành công!",
        user: userWithoutPassword
    });
});
router.post("/login", (req, res, next) => authController.login(req, res, next));
router.post("/google", (req, res, next) => authController.googleLogin(req, res, next));
router.put("/profile", (req, res, next) => authController.syncProfile(req, res, next));

export default router;
