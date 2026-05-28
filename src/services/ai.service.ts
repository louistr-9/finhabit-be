import { GoogleGenerativeAI } from "@google/generative-ai";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export interface ChatTurn {
    role: "user" | "assistant";
    content: string;
}

export type AIParseResult =
    | { type: 'transaction', data: { title: string; amount: number; category: string; transactionType: 'EXPENSE' | 'INCOME' }, message: string }
    | { type: 'batch_transaction', data: { title: string; amount: number; category: string; transactionType: 'EXPENSE' | 'INCOME' }[], message: string }
    | { type: 'habit_progress', data: { habit_id: string; habit_name: string; current_value: number; goal_value: number; unit: string }[], message: string }
    | { type: 'chat', message: string }
    | { type: 'unknown', message: string };

export class AIService {

    // Lấy danh sách thói quen hôm nay để AI biết người dùng đang có những thói quen gì
    private async getUserHabitsForAI(userId: string) {
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        const habits = await prisma.habit.findMany({
            where: { userId },
            include: {
                logs: {
                    where: { date: today }
                }
            }
        });

        if (habits.length === 0) return '(Chưa có thói quen nào)';

        return habits.map(h => {
            const todayLog = h.logs[0];
            const current_value = todayLog ? (todayLog.completed ? 1 : 0) : 0; // Giả lập đơn giản vì schema chưa có số lượng
            return `- id="${h.id}" | Tên: "${h.name}" | Trạng thái: ${todayLog?.completed ? 'Đã xong ✓' : 'Chưa xong'}`;
        }).join('\n');
    }

    // Lấy tình hình tài chính tháng này để AI chém gió
    private async getUserFinancialContext(userId: string) {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);

        const txs = await prisma.transaction.findMany({
            where: {
                userId,
                createdAt: { gte: startOfMonth, lte: endOfMonth }
            }
        });

        if (txs.length === 0) return '(Chưa có giao dịch nào tháng này)';

        const income = txs.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);
        const expense = txs.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);

        return `Tháng ${today.getMonth() + 1}/${today.getFullYear()} — Tổng Thu: ${income.toLocaleString('vi-VN')}đ | Tổng Chi: ${expense.toLocaleString('vi-VN')}đ.`;
    }

    // Gửi Prompt cho Gemini để ép nó nhả JSON
    async parseNaturalLanguage(userId: string, input: string, chatHistory: ChatTurn[] = []): Promise<AIParseResult> {
        if (!process.env.GEMINI_API_KEY) {
            return { type: 'chat', message: "Mình chưa được cắm não (Thiếu GEMINI_API_KEY). Nhờ sếp cắm vào file .env nhé! 🧠" };
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const [habitsContext, financialContext] = await Promise.all([
            this.getUserHabitsForAI(userId),
            this.getUserFinancialContext(userId)
        ]);

        const historyStr = chatHistory.length > 0
            ? '\nLỊCH SỬ CHAT GẦN ĐÂY:\n' + chatHistory.map(t => `[${t.role === 'user' ? 'User' : 'Bot'}]: ${t.content}`).join('\n')
            : '';

        const prompt = `Bạn là "FinHabit Bot" – trợ lý AI siêu thông minh, dí dỏm và thân thiện.

PHONG CÁCH: Tiếng Việt tự nhiên, hài hước, có dùng emoji (1-2 cái). Câu trả lời ngắn gọn, tối đa 3-4 câu. Luôn xưng "mình" và gọi "sếp" hoặc "bạn".

DỮ LIỆU TÀI CHÍNH THÁNG NÀY (Để chém gió/khuyên bảo):
${financialContext}

DANH SÁCH THÓI QUEN (Dùng để lấy habit_id khi người dùng báo cáo điểm danh):
${habitsContext}
${historyStr}

PHÂN TÍCH YÊU CẦU:
1. Ghi chép 1 giao dịch: "Ăn sáng 30k", "Lương 10 củ" -> type: transaction
2. Ghi chép NHIỀU giao dịch: "Sáng phở 50k, trưa cơm 40k" -> type: batch_transaction
3. Điểm danh thói quen: "Xong đọc sách", "chạy bộ xong rồi" -> type: habit_progress
4. Trò chuyện bình thường: Hỏi han tài chính, tâm sự, chửi thề, khen ngợi -> type: chat

QUY TẮC:
- Số tiền: 50k -> 50000. 10 củ -> 10000000.
- Nếu điểm danh thói quen, cố gắng tìm habit_id trong danh sách. Nếu không có thì bỏ qua.
- TRẢ VỀ ĐÚNG 1 ĐỊNH DẠNG JSON THUẦN (KHÔNG BỌC TRONG \`\`\`json ... \`\`\`, CHỈ CHỮ JSON).

ĐỊNH DẠNG JSON TRẢ VỀ:
1. Giao dịch đơn:
{"type":"transaction","message":"Tuyệt vời sếp! Mình đã ghi nhận 30k tiền ăn sáng.","data":{"title":"Ăn sáng","amount":30000,"category":"Ăn uống","transactionType":"EXPENSE"}}

2. Giao dịch chùm:
{"type":"batch_transaction","message":"Đã ghi nhận 2 khoản chi của sếp.","data":[{"title":"Phở","amount":50000,"category":"Ăn uống","transactionType":"EXPENSE"},...]}

3. Điểm danh thói quen:
{"type":"habit_progress","message":"Chúc mừng sếp đã hoàn thành thói quen đọc sách!","data":[{"habit_id":"...","habit_name":"...","current_value":1,"goal_value":1,"unit":"lần"}]}

4. Trò chuyện bình thường / Tư vấn:
{"type":"chat","message":"Tháng này sếp tiêu hơi lố rồi nha, phanh lại bớt đi! 😂"}

Câu chat của sếp: "${input}"`;

        try {
            const response = await model.generateContent(prompt);
            let text = response.response.text().trim();
            
            // Xóa backticks markdown nếu có
            if (text.startsWith('```json')) text = text.replace('```json', '');
            if (text.startsWith('```')) text = text.replace('```', '');
            if (text.endsWith('```')) text = text.replace(/```$/, '');
            text = text.trim();

            const parsed = JSON.parse(text);
            return parsed as AIParseResult;
        } catch (error) {
            console.error("AI Parse Error:", error);
            return { type: 'unknown', message: "Trời đất ơi, não mình bị chập mạch rồi (Lỗi AI). Sếp thử nói lại câu khác xem sao? 🔧" };
        }
    }

    // Xử lý Database
    async executeAIAction(userId: string, result: AIParseResult): Promise<string> {
        try {
            if (result.type === 'transaction') {
                await prisma.transaction.create({
                    data: {
                        userId,
                        title: result.data.title,
                        description: `(AI Bot) ${result.data.title}`,
                        amount: result.data.amount,
                        type: result.data.transactionType
                    }
                });
            } 
            else if (result.type === 'batch_transaction') {
                for (const t of result.data) {
                    await prisma.transaction.create({
                        data: {
                            userId,
                            title: t.title,
                            description: `(AI Bot) ${t.title}`,
                            amount: t.amount,
                            type: t.transactionType
                        }
                    });
                }
            } 
            else if (result.type === 'habit_progress') {
                const today = new Date();
                today.setUTCHours(0, 0, 0, 0);

                for (const h of result.data) {
                    // Cập nhật bằng cách upsert log
                    const habitId = h.habit_id;
                    const existingLog = await prisma.habitLog.findUnique({
                        where: { habitId_date: { habitId, date: today } }
                    });

                    if (existingLog) {
                        await prisma.habitLog.update({
                            where: { id: existingLog.id },
                            data: { completed: true }
                        });
                    } else {
                        await prisma.habitLog.create({
                            data: { userId, habitId, date: today, completed: true }
                        });
                    }
                }
            }

            return result.message;
        } catch (error) {
            console.error("Execute AI Error:", error);
            return "Đã hiểu ý sếp nhưng mà... ghi vào sổ thất bại rồi. Database đang nghẽn! 😭";
        }
    }
}
