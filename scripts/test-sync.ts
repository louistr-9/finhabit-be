import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("=== KIỂM TRA DỮ LIỆU BACKEND ===");
    const users = await prisma.user.findMany({
        select: {
            email: true,
            telegramChatId: true,
            discordUserId: true,
            geminiApiKey: true
        }
    });
    
    if (users.length === 0) {
        console.log("❌ Chưa có User nào trong Backend (PostgreSQL).");
    } else {
        users.forEach(user => {
            console.log(`- Email: ${user.email}`);
            console.log(`  + Telegram Chat ID: ${user.telegramChatId || 'Trống'}`);
            console.log(`  + Discord User ID: ${user.discordUserId || 'Trống'}`);
            console.log(`  + Gemini API Key: ${user.geminiApiKey ? 'Đã lưu (***)' : 'Trống'}`);
            console.log("-------------------------------");
        });
        console.log("✅ Truy xuất thành công!");
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
