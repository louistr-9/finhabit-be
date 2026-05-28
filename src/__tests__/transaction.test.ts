import { describe, it, expect } from "vitest";

describe("Bài Test Khởi Động: Kiểm tra Toán Học Cơ Bản", () => {
    it("1 cộng 1 phải bằng 2", () => {
        const a = 1;
        const b = 1;
        const tong = a + b;

        expect(tong).toBe(2)
    });
    it("Chữ 'FinHabit' phải chứa chữ 'Habit'", () => {
        const text = "FinHabit";
        expect(text).toContain("Habit");
    });
});

