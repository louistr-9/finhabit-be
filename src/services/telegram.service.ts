import TelegramBot from "node-telegram-bot-api";
import { PrismaClient } from "@prisma/client";
import { AIService, ChatTurn } from "./ai.service";

const prisma = new PrismaClient();
const aiService = new AIService();

// Lấy Token từ file .env
const token = process.env.TELEGRAM_BOT_TOKEN;
let bot: TelegramBot | null = null;

// Lưu trữ lịch sử chat tạm thời trong RAM (Mỗi user lưu 6 câu gần nhất)
const chatHistoryMap = new Map<string, ChatTurn[]>();

if (token) {
    // Khởi tạo Bot với tính năng Lắng nghe (polling)
    bot = new TelegramBot(token, { polling: true });

    // Lắng nghe lệnh /start để kết nối tài khoản
    bot.onText(/\/start (.+)/, async (msg, match) => {
        const chatId = msg.chat.id.toString();
        // Giả sử mã kích hoạt là email của User hoặc 1 mã định danh
        const userEmail = match ? match[1] : null;

        if (!userEmail) {
            bot?.sendMessage(chatId, "Vui lòng nhập cú pháp: /start <email_của_bạn>");
            return;
        }

        try {
            // Tìm user bằng email và lưu ChatID
            const user = await prisma.user.findUnique({ where: { email: userEmail } });
            
            if (user) {
                await prisma.user.update({
                    where: { email: userEmail },
                    data: { telegramChatId: chatId }
                });
                bot?.sendMessage(chatId, `✅ Chào ${user.name}! Tài khoản của bạn đã được kết nối thành công với Bot FinHabit. Từ nay tôi sẽ tự động nhắc nhở bạn!`);
            } else {
                bot?.sendMessage(chatId, "❌ Không tìm thấy tài khoản nào với email này trong hệ thống.");
            }
        } catch (error) {
            console.error("Lỗi khi kết nối Telegram:", error);
            bot?.sendMessage(chatId, "Hệ thống đang gặp lỗi, vui lòng thử lại sau.");
        }
    });

    // Nếu chỉ gõ /start không có tham số
    bot.onText(/^\/start$/, (msg) => {
        const chatId = msg.chat.id.toString();
        bot?.sendMessage(chatId, "👋 Chào mừng đến với FinHabit Bot!\n\nĐể kết nối tài khoản của bạn để nhận nhắc nhở, vui lòng gõ:\n👉 `/start email_của_bạn@gmail.com`", { parse_mode: "Markdown" });
    });

    // ==================================================
    // TRỢ LÝ AI (SỬ DỤNG GOOGLE GEMINI)
    // ==================================================
    bot.on('message', async (msg) => {
        if (!msg.text || msg.text.startsWith('/')) return; // Bỏ qua nếu là lệnh (như /start)

        const chatId = msg.chat.id.toString();
        const text = msg.text.trim();

        try {
            // 1. Tìm user qua ChatID
            const user = await prisma.user.findFirst({ where: { telegramChatId: chatId } });
            if (!user) {
                bot?.sendMessage(chatId, "⚠️ Bạn chưa kết nối tài khoản. Vui lòng gõ /start <email> trước nhé!");
                return;
            }

            // Gửi hiệu ứng "đang gõ..." để user biết Bot đang suy nghĩ
            bot?.sendChatAction(chatId, 'typing');

            // 2. Lấy lịch sử chat
            let history = chatHistoryMap.get(chatId) || [];
            
            // 3. Phân tích ngữ nghĩa bằng Gemini
            const parseResult = await aiService.parseNaturalLanguage(user.id, text, history);

            // 4. Thực thi (Lưu DB)
            const replyMessage = await aiService.executeAIAction(user.id, parseResult);

            // 5. Gửi tin nhắn trả lời
            bot?.sendMessage(chatId, replyMessage, { parse_mode: "HTML" });

            // 6. Cập nhật lịch sử chat (Lưu 6 câu gần nhất)
            history.push({ role: 'user', content: text });
            history.push({ role: 'assistant', content: replyMessage });
            if (history.length > 6) history = history.slice(-6);
            chatHistoryMap.set(chatId, history);

        } catch (error) {
            console.error("Lỗi khi xử lý tin nhắn chat bằng AI:", error);
            bot?.sendMessage(chatId, "❌ Não AI đang bị quá tải, sếp đợi xíu rồi thử lại nha!");
        }
    });

    console.log("🤖 Telegram Bot đã sẵn sàng!");
} else {
    console.log("⚠️ Không tìm thấy TELEGRAM_BOT_TOKEN trong .env. Bot bị vô hiệu hóa.");
}

export class TelegramService {
    // Hàm gọi từ nơi khác (Cron, API) để gửi tin nhắn
    async sendMessage(userId: string, message: string) {
        if (!bot) return false;

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user || !user.telegramChatId) {
            console.log(`User ${userId} chưa kết nối Telegram.`);
            return false;
        }

        try {
            await bot.sendMessage(user.telegramChatId, message, { parse_mode: "HTML" });
            return true;
        } catch (error) {
            console.error("Lỗi gửi tin nhắn Telegram:", error);
            return false;
        }
    }
}
