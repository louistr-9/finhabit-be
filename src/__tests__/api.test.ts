import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../index";

describe("API Testing: Transaction Routes", () => {

    it("Phải văng lỗi 401 khi Hacker gọi PUT /api/transactions/:id mà không có Token", async () => {
        const fakeTransactionId = "12345-abcde";
        const hackerPayload = {
            amount: 9999999,
            description: "Hacked!"
        };

        const response = await request(app)
            .put(`/api/transactions/${fakeTransactionId}`)
            .send(hackerPayload);

        expect(response.status).toBe(401);

        expect(response.body.message).toBe("Không có token truy cập");
    });

});
