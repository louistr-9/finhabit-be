import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();
const authController = new AuthController();

router.post("/register", (req, res, next) => authController.register(req, res, next));
router.get("/me", authenticate, (req, res) => {
    res.json({
        message: "Bảo vệ API thành công!",
        user: (req as any).user
    });
});
router.post("/login", (req, res, next) => authController.login(req, res, next));
router.post("/google", (req, res, next) => authController.googleLogin(req, res, next));
router.put("/profile", (req, res, next) => authController.syncProfile(req, res, next));

export default router;
