import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const email = "louistran090902@gmail.com";
    
    await prisma.user.update({
        where: { email },
        data: {
            telegramChatId: "5102326857, 6053807947",
            discordUserId: "1028670429453353001, 1377117506082308096",
            geminiApiKey: "AIzaSyAi2LIwhcYAZRivPo4MR08S8qQ-qPWsqq0"
        }
    });

    console.log("✅ Đã ghi đè dữ liệu trực tiếp vào Database thành công!");
    
    const user = await prisma.user.findUnique({ where: { email } });
    console.log(user);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
