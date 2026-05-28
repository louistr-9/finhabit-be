import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const newUser = await prisma.user.create({
        data: {
            email: "test@finhabit.com",
            name: "FinHabit Tester",
            password: "123456",
        },
    });
    console.log("✅ Đã tạo user:", newUser);

    const allUsers = await prisma.user.findMany();
    console.log("📋 Danh sách users:", allUsers);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
