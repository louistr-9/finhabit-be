import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class RecurringService {

    async createRecurring(userId: string, data: any) {
        return await prisma.recurringTransaction.create({
            data: { 
                userId, 
                title: data.title, 
                amount: data.amount, 
                type: data.type, 
                frequency: data.frequency, 
                dayOfMonth: data.day_of_month || data.dayOfMonth || null, 
                dayOfWeek: data.day_of_week || data.dayOfWeek || null,
                category: data.category,
                assetId: data.asset_id || data.assetId || null,
                isActive: true
            }
        });
    }

    async getRecurrings(userId: string) {
        return await prisma.recurringTransaction.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
    }

    async deleteRecurring(userId: string, id: string) {
        const recurring = await prisma.recurringTransaction.findUnique({ where: { id } });
        if (!recurring || recurring.userId !== userId) throw new Error("Không hợp lệ");
        
        return await prisma.recurringTransaction.delete({ where: { id } });
    }
}
