import { Router } from "express";
import { DebtController } from "../controllers/debt.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();
const debtController = new DebtController();

router.use(authenticate);

// API Tính Tổng tài sản ròng (Phải đặt TRƯỚC /:id để không bị nhầm id="net-worth")
router.get("/net-worth", (req, res, next) => debtController.getAll(req, res, next));

// CRUD Nợ
router.post("/", (req, res, next) => debtController.create(req, res, next));
router.get("/", (req, res, next) => debtController.getAll(req, res, next));
router.delete("/:id", (req, res, next) => debtController.delete(req, res, next));

export default router;
