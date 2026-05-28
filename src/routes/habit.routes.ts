import { Router } from "express";
import { HabitController } from "../controllers/habit.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();
const habitController = new HabitController();

router.use(authenticate);

// 2. Quản lý Thói quen (Habits)
router.post("/", (req, res, next) => habitController.createHabit(req, res, next));
router.get("/", (req, res, next) => habitController.getAllHabits(req, res, next));
router.delete("/:id", (req, res, next) => habitController.deleteHabit(req, res, next));

// 3. Check-in Thói quen hàng ngày
router.post("/:id/checkin", (req, res, next) => habitController.toggleCheckIn(req, res, next));

export default router;
