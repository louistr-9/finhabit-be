import cron from "node-cron";
import { PrismaClient } from "@prisma/client";
import { TelegramService } from "./telegram.service";

const prisma = new PrismaClient();
const telegramService = new TelegramService();

export class CronService {
    
    startJobs() {
        console.log("⏰ Hệ thống Automation (Cron Jobs) đã được khởi động!");

        // ==========================================
        // CRON 1: NHẮC NHỞ ĐIỂM DANH THÓI QUEN
        // Chạy vào lúc 20:00 (8h tối) mỗi ngày
        // (Để test nhanh, bạn có thể sửa thành "* * * * *" để chạy mỗi phút)
        // ==========================================
        cron.schedule("0 20 * * *", async () => {
            console.log("🔄 Bắt đầu quét dữ liệu để nhắc nhở Thói quen...");
            
            try {
                // Lấy ngày hôm nay (chỉ lấy ngày, bỏ giờ)
                const today = new Date();
                today.setUTCHours(0, 0, 0, 0);

                // Lấy tất cả user có thói quen
                const users = await prisma.user.findMany({
                    where: { telegramChatId: { not: null } },
                    include: {
                        habits: {
                            include: {
                                logs: {
                                    where: { date: today }
                                }
                            }
                        }
                    }
                });

                for (const user of users) {
                    let uncompletedHabits: string[] = [];

                    for (const habit of user.habits) {
                        // Nếu hôm nay chưa có log, tức là chưa điểm danh
                        if (habit.logs.length === 0) {
                            uncompletedHabits.push(habit.name);
                        }
                    }

                    if (uncompletedHabits.length > 0) {
                        const message = `🔔 <b>Ting Ting! Đã 8h tối rồi sếp ơi!</b>\n\nHôm nay sếp chưa hoàn thành các thói quen sau:\n👉 ${uncompletedHabits.join("\n👉 ")}\n\nHãy vào FinHabit để check-in ngay nhé!`;
                        await telegramService.sendMessage(user.id, message);
                    }
                }
            } catch (error) {
                console.error("Lỗi khi chạy Cron Nhắc nhở:", error);
            }
        });

        // ==========================================
        // CRON 2: TỰ ĐỘNG THÊM GIAO DỊCH (LƯƠNG, TIỀN NHÀ)
        // Chạy vào lúc 00:01 sáng mỗi ngày
        // ==========================================
        cron.schedule("1 0 * * *", async () => {
            console.log("🔄 Bắt đầu quét Giao dịch định kỳ...");
            
            try {
                const today = new Date();
                const currentDayOfMonth = today.getDate(); // Ngày mùng mấy
                const currentDayOfWeek = today.getDay();   // Thứ mấy (0 = CN, 1 = T2)

                const recurrings = await prisma.recurringTransaction.findMany();

                for (const recurring of recurrings) {
                    let shouldExecute = false;

                    if (recurring.frequency === "DAILY") {
                        shouldExecute = true;
                    } 
                    else if (recurring.frequency === "WEEKLY" && recurring.dayOfWeek === currentDayOfWeek) {
                        shouldExecute = true;
                    } 
                    else if (recurring.frequency === "MONTHLY" && recurring.dayOfMonth === currentDayOfMonth) {
                        shouldExecute = true;
                    }

                    if (shouldExecute) {
                        // 1. Tự động thêm vào bảng Transaction
                        await prisma.transaction.create({
                            data: {
                                userId: recurring.userId,
                                amount: recurring.amount,
                                type: recurring.type,
                                category: recurring.category,
                                title: `(Tự động) ${recurring.title}`
                            }
                        });

                        // 2. Gửi tin nhắn Telegram báo hỉ / báo nợ
                        const typeEmoji = recurring.type === "INCOME" ? "💰" : "💸";
                        const actionText = recurring.type === "INCOME" ? "vừa được cộng" : "vừa bị trừ";
                        const message = `🤖 <b>FinHabit Tự Động</b>\n\nSếp ${actionText} <b>${recurring.amount.toLocaleString("vi-VN")}đ</b> cho khoản: <i>${recurring.title}</i>.\n\nHệ thống đã tự động ghi nhận vào sổ thu chi! ${typeEmoji}`;
                        
                        await telegramService.sendMessage(recurring.userId, message);
                    }
                }
            } catch (error) {
                console.error("Lỗi khi chạy Cron Giao dịch:", error);
            }
        });
    }
}
