import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class AssetService {

    async createAsset(userId: string, data: any) {
        return await prisma.asset.create({
            data: { 
                userId, 
                name: data.name, 
                type: data.type, 
                symbol: data.symbol || undefined, 
                value: Number(data.value) || 0,
                purchasePrice: Number(data.purchasePrice || data.purchase_price) || 0,
                quantity: data.quantity ? Number(data.quantity) : undefined,
                description: data.description || undefined,
                targetAmount: data.targetAmount || data.target_amount ? Number(data.targetAmount || data.target_amount) : undefined,
                targetDate: data.targetDate || data.target_date ? new Date(data.targetDate || data.target_date) : undefined
            }
        });
    }

    async getAssets(userId: string) {
        return await prisma.asset.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
    }
    
    async deleteAsset(userId: string, assetId: string) {
        const asset = await prisma.asset.findUnique({ where: { id: assetId } });
        if (!asset || asset.userId !== userId) throw new Error("Không hợp lệ");
        
        return await prisma.asset.delete({ where: { id: assetId } });
    }
}
