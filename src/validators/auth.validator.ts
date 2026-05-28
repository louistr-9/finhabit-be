import { z } from "zod";

export const registerSchema = z.object({
    email: z.string().email("Email không đúng định dạng"),
    name: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
    password: z.string().min(6, "Mật khẩu phải dài ít nhất 6 ký tự")
});
export const loginSchema = z.object({
    email: z.string().email("Email không đúng định dạng"),
    password: z.string().min(1, "Vui lòng nhập mật khẩu")
});
