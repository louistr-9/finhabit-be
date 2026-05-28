import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class DebtService {

    // 1. Tạo khoản Nợ/Cho mượn
    async createDebt(userId: string, data: any) {
        return await prisma.debt.create({
            data: { 
                userId, 
                type: data.type,
                contactName: data.contactName || data.contact_name || data.name,
                amount: Number(data.amount),
                paidAmount: data.paidAmount ? Number(data.paidAmount) : 0,
                dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
                notes: data.notes || undefined,
                groupName: data.groupName || undefined,
                status: data.status || "active"
            }
        });
    }

    // 2. Lấy danh sách Nợ
    async getDebts(userId: string) {
        return await prisma.debt.findMany({
            where: { userId },
            orderBy: { date: 'desc' }
        });
    }
    
    // 3. Xóa khoản nợ
    async deleteDebt(userId: string, debtId: string) {
        const debt = await prisma.debt.findUnique({ where: { id: debtId } });
        if (!debt || debt.userId !== userId) throw new Error("Không hợp lệ");
        
        return await prisma.debt.delete({ where: { id: debtId } });
    }

    // 4. TÍNH TỔNG TÀI SẢN RÒNG (NET WORTH)
    async getNetWorth(userId: string) {
        const assets = await prisma.asset.findMany({ where: { userId } });
        const debts = await prisma.debt.findMany({ where: { userId, status: "active" } });

        let totalAssetValue = 0;
        assets.forEach(a => totalAssetValue += a.value);

        let totalDebt = 0;
        debts.forEach(d => {
            if (d.type === "borrowed") {
                totalDebt += (d.amount - d.paidAmount);
            } else if (d.type === "lent") {
                totalAssetValue += (d.amount - d.paidAmount);
            }
        });

        return {
            totalAssetValue,
            totalDebt,
            netWorth: totalAssetValue - totalDebt
        };
    }
}
