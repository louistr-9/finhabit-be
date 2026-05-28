import { Router } from "express";
import { AssetController } from "../controllers/asset.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();
const assetController = new AssetController();

router.use(authenticate);

// Gọi API lấy giá Live
router.get("/live-price", (req, res, next) => assetController.getLivePrice(req, res, next));

// CRUD Tài sản
router.post("/", (req, res, next) => assetController.create(req, res, next));
router.get("/", (req, res, next) => assetController.getAll(req, res, next));
router.delete("/:id", (req, res, next) => assetController.delete(req, res, next));

export default router;