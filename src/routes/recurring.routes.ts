import { Router } from "express";
import { RecurringController } from "../controllers/recurring.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();
const recurringController = new RecurringController();

router.use(authenticate);

// CRUD
router.post("/", (req, res, next) => recurringController.create(req, res, next));
router.get("/", (req, res, next) => recurringController.getAll(req, res, next));
router.delete("/:id", (req, res, next) => recurringController.delete(req, res, next));

export default router;
