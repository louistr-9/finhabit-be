import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import { errorHandler } from "./middlewares/error.middleware";
import transactionRoutes from "./routes/transaction.routes";

dotenv.config();

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

app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);

app.use(errorHandler);
if (process.env.NODE_ENV !== "test") {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

export default app;
