import { Request, Response, NextFunction } from "express";
import { TransactionService } from "../services/transaction.service";

const transactionService = new TransactionService();

export class TransactionController {

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { title, amount, type, category, date } = req.body;
      const userId = (req as any).user.userId;

      const transaction = await transactionService.createTransaction(userId, title, amount, type, category, date ? new Date(date) : undefined);

      res.status(201).json({
        success: true,
        message: "Tạo giao dịch thành công",
        data: transaction
      });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;

      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 10;
      const type = req.query.type as string;

      const result = await transactionService.getTransactions(userId, page, limit, type);

      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const userID = (req as any).user.userId;
      const transactionID = req.params.id as string;
      const updateData = req.body;
      const updateTransaction = await transactionService.updateTransaction(
        userID,
        transactionID,
        updateData
      );
      res.status(200).json({
        success: true,
        message: "Cập nhật thành công",
        data: updateTransaction
      });
    } catch (error) {
      next(error);
    }
  }
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const userID = (req as any).user.userId;
      const transactionID = req.params.id as string;

      await transactionService.deleteTransaction(
        userID,
        transactionID
      );
      res.status(200).json({
        success: true,
        message: "Xóa giao dịch thành công",
      });
    } catch (error) {
      next(error);
    }
  }
  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;
      const stats = await transactionService.getStats(userId);

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

}
