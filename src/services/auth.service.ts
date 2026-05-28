import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export class AuthService {

    async register(email: string, name: string, password: string) {
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            throw new Error("Email này đã được đăng ký");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                email,
                name,
                password: hashedPassword,
            },
        });

        const { password: _, ...userWithoutPassword } = newUser;
        return userWithoutPassword;
    }

    async login(email: string, password: string) {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            throw new Error("Tài khoản không tồn tại");
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error("Mật khẩu không chính xác");
        }

        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET as string,
            { expiresIn: "7d" }
        );

        const { password: _, ...userWithoutPassword } = user;

        return {
            user: userWithoutPassword,
            token,
        };
    }

    async googleLogin(email: string, name: string, avatarUrl: string) {
        let user = await prisma.user.findUnique({ where: { email } });
        
        if (!user) {
            const randomPassword = await bcrypt.hash(Math.random().toString(36).slice(-10), 10);
            user = await prisma.user.create({
                data: {
                    email,
                    name,
                    password: randomPassword,
                    avatarUrl
                }
            });
        } else if (!user.avatarUrl && avatarUrl) {
            user = await prisma.user.update({
                where: { email },
                data: { avatarUrl }
            });
        }

        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET as string,
            { expiresIn: "7d" }
        );

        const { password: _, ...userWithoutPassword } = user;

        return {
            user: userWithoutPassword,
            token,
        };
    }
}
