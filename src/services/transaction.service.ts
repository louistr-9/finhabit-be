import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class TransactionService {

    async createTransaction(userId: string, title: string, amount: number, type: string, category: string, date?: Date) {
        return await prisma.transaction.create({
            data: { userId, title, amount, type, category, date: date || new Date() }
        });
    }

    async getTransactions(
        userId: string,
        page: number = 1,
        limit: number = 10,
        type?: string
    ) {
        const skip = (page - 1) * limit;

        const whereCondition: any = {
            userId: userId
        };

        if (type) {
            whereCondition.type = type;
        }

        const transactions = await prisma.transaction.findMany({
            where: whereCondition,
            skip: skip,
            take: limit,
            orderBy: { date: 'desc' }
        });

        const totalRecords = await prisma.transaction.count({
            where: whereCondition
        });

        const totalPages = Math.ceil(totalRecords / limit);

        return {
            data: transactions,
            pagination: {
                page: page,
                limit: limit,
                totalRecords: totalRecords,
                totalPages: totalPages
            }
        };
    }
    async updateTransaction(userID: string, transactionID: string, updateData: any) {
        const transaction = await prisma.transaction.findUnique({
            where: {
                id: transactionID,
            }
        })
        if (!transaction) {
            throw new Error("Không tìm thấy giao dịch");
        }
        if (transaction.userId !== userID) {
            throw new Error("Bạn không có quyền sửa giao dịch này");
        }
        return await prisma.transaction.update({
            where: {
                id: transactionID
            },
            data: updateData
        })
    }
    async deleteTransaction(userID: string, transactionID: string) {
        const transaction = await prisma.transaction.findUnique({
            where: {
                id: transactionID,
            }
        })
        if (!transaction) {
            throw new Error("Không tìm thấy giao dịch");
        }
        if (transaction.userId !== userID) {
            throw new Error("Bạn không có quyền xóa giao dịch này");
        }
        return await prisma.transaction.delete({
            where: {
                id: transactionID
            }
        })
    }
    async getStats(userId: string) {
        const stats = await prisma.transaction.groupBy({
            by: ['type'],
            where: { userId: userId },
            _sum: { amount: true }
        });

        let totalIncome = 0;
        let totalExpense = 0;

        stats.forEach(item => {
            if (item.type === "income") {
                totalIncome = item._sum.amount || 0;
            } else if (item.type === "expense") {
                totalExpense = item._sum.amount || 0;
            }
        });

        return {
            totalIncome,
            totalExpense,
            balance: totalIncome - totalExpense
        };
    }
}
