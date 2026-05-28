import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import { errorHandler } from "./middlewares/error.middleware";
import transactionRoutes from "./routes/transaction.routes";

import dotenv from "dotenv";
dotenv.config();

import "./services/telegram.service"; // Khởi động Telegram Bot (Lắng nghe /start)
import { CronService } from "./services/cron.service";

const cronService = new CronService();
cronService.startJobs(); // Kích hoạt đồng hồ tự động

const app = express();

app.use(express.json());

app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
}));

const PORT = process.env.PORT || 5000;

app.get("/", (req: Request, res: Response) => {
    res.send("Hello World - Có tích hợp CORS!");
});

import habitRoutes from "./routes/habit.routes";
import assetRoutes from "./routes/asset.routes";
import debtRoutes from "./routes/debt.routes";
import recurringRoutes from "./routes/recurring.routes";

app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/habits", habitRoutes);
app.use("/api/assets", assetRoutes);
app.use("/api/debts", debtRoutes);
app.use("/api/recurring", recurringRoutes);

app.use(errorHandler);
if (process.env.NODE_ENV !== "test") {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

export default app;
