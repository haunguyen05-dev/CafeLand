import express from "express";
import { connectDB } from "../db.js"; // Lưu ý: phải có đuôi .js

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        // 1. Kết nối Database
        const db = await connectDB();
        const users = db.collection("users");

        // 2. Lấy dữ liệu từ Frontend gửi lên
        const { email, password } = req.body;

        // 3. Kiểm tra dữ liệu đầu vào
        if (!email || !password) {
            return res.status(400).json({ message: "Vui lòng nhập đầy đủ email và mật khẩu" });
        }

        // 4. Tìm user theo email
        const user = await users.findOne({ email });

        // 5. Nếu không tìm thấy user
        if (!user) {
            return res.status(400).json({ message: "Email này chưa được đăng ký" });
        }

        // 6. Kiểm tra mật khẩu
        // Lưu ý: Code này đang so sánh chuỗi thô (khớp với file register của bạn).
        // Trong thực tế nên dùng bcrypt để mã hóa.
        if (user.password !== password) {
            return res.status(400).json({ message: "Mật khẩu không chính xác" });
        }

        // 7. Xử lý dữ liệu trả về (Không trả về mật khẩu cho Client)
        const userData = {
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role || "user" // Ví dụ nếu có phân quyền
        };

        // 8. Trả về thành công
        return res.status(200).json({
            message: "Đăng nhập thành công",
            user: userData // Trả về object này để Frontend lưu vào localStorage
        });

    } catch (err) {
        console.error("Lỗi login:", err);
        res.status(500).json({ message: "Lỗi server" });
    }
});

export default router;