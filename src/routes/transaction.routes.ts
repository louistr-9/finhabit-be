import { Router } from "express";
import { TransactionController } from "../controllers/transaction.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();
const transactionController = new TransactionController();

router.use(authenticate);

router.post("/", (req, res, next) => transactionController.create(req, res, next));

router.get("/", (req, res, next) => transactionController.getAll(req, res, next));
router.get("/stats", (req, res, next) => transactionController.getStats(req, res, next));

router.put("/:id", (req, res, next) => transactionController.update(req, res, next));

router.delete("/:id", (req, res, next) => transactionController.delete(req, res, next));
export default router;

