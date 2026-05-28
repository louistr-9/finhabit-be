import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.error("🔥 Error Captured:", err.message);

    if (err instanceof ZodError) {
        return res.status(400).json({
            success: false,
            message: err.issues[0].message,
        });
    }

    const statusCode = err.statusCode || 400;
    return res.status(statusCode).json({
        success: false,
        message: err.message || "Lỗi máy chủ nội bộ",
    });
};
