import { Request, Response, NextFunction } from "express";
import { AssetService } from "../services/asset.service";

const assetService = new AssetService();

export class AssetController {

    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user.userId;
            const asset = await assetService.createAsset(userId, req.body);

            res.status(201).json({
                success: true,
                message: "Thêm tài sản thành công",
                data: asset
            });
        } catch (error) {
            next(error);
        }
    }

    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user.userId;
            const assets = await assetService.getAssets(userId);

            res.status(200).json({
                success: true,
                data: assets
            });
        } catch (error) {
            next(error);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user.userId;
            const assetId = req.params.id;

            await assetService.deleteAsset(userId, assetId);

            res.status(200).json({
                success: true,
                message: "Xóa tài sản thành công"
            });
        } catch (error) {
            next(error);
        }
    }

    async getLivePrice(req: Request, res: Response, next: NextFunction) {
        try {
            const symbol = req.query.symbol as string;
            // Fake giá live
            let price = 0;
            if (symbol === "SJC") price = 85000000;
            if (symbol === "BTCUSDT") price = 1500000000;

            res.status(200).json({
                success: true,
                price
            });
        } catch (error) {
            next(error);
        }
    }
}
