import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class HabitService {

    // 2. Tạo Thói quen (Habit)
    async createHabit(userId: string, data: any) {
        return await prisma.habit.create({
            data: {
                userId,
                name: data.name,
                icon: data.icon || undefined,
                color: data.color || undefined,
                description: data.description || undefined,
                groupName: data.group_name || data.groupName || undefined,
                unit: data.unit || "lần",
                goalValue: data.goal_value || data.goalValue ? Number(data.goal_value || data.goalValue) : 1,
                reminderTime: data.reminder_time || data.reminderTime || undefined,
                frequency: data.frequency || undefined,
                linkedFinanceCategory: data.linked_finance_category || data.linkedFinanceCategory || undefined,
            }
        });
    }

    // 3. Lấy toàn bộ danh sách Thói quen kèm Thống kê (Streak)
    async getHabits(userId: string) {
        const habits = await prisma.habit.findMany({
            where: { userId },
            include: {
                logs: {
                    orderBy: { date: 'desc' } 
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        const habitsWithStats = habits.map(habit => {
            let currentStreak = 0;
            let todayCompleted = false;

            if (habit.logs.length > 0) {
                const firstLogDate = habit.logs[0].date.getTime();
                if (firstLogDate === today.getTime()) {
                    todayCompleted = true;
                }

                if (firstLogDate !== today.getTime() && firstLogDate !== yesterday.getTime()) {
                    currentStreak = 0;
                } else {
                    let expectedDate = new Date(habit.logs[0].date); 
                    
                    for (const log of habit.logs) {
                        if (log.date.getTime() === expectedDate.getTime()) {
                            currentStreak++; 
                            expectedDate.setDate(expectedDate.getDate() - 1); 
                        } else {
                            break; 
                        }
                    }
                }
            }

            return {
                ...habit,
                todayCompleted,
                currentStreak
            };
        });

        return habitsWithStats;
    }

    // 4. Xóa Thói quen
    async deleteHabit(userId: string, habitId: string) {
        const habit = await prisma.habit.findUnique({ where: { id: habitId } });
        if (!habit) throw new Error("Không tìm thấy thói quen");
        if (habit.userId !== userId) throw new Error("Bạn không có quyền xóa");

        return await prisma.habit.delete({ where: { id: habitId } });
    }

    // 5. Check-in Thói quen
    async toggleCheckIn(userId: string, habitId: string, dateStr: string) {
        const habit = await prisma.habit.findUnique({ where: { id: habitId } });
        if (!habit || habit.userId !== userId) {
            throw new Error("Không hợp lệ");
        }

        const date = new Date(dateStr);
        date.setUTCHours(0, 0, 0, 0); 

        const existingLog = await prisma.habitLog.findUnique({
            where: {
                habitId_date: { habitId, date }
            }
        });

        if (existingLog) {
            await prisma.habitLog.delete({ where: { id: existingLog.id } });
            return { message: "Đã hủy điểm danh", checked: false };
        } else {
            await prisma.habitLog.create({
                data: { habitId, userId, date }
            });
            return { message: "Điểm danh thành công", checked: true };
        }
    }
}
