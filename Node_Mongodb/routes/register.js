import express from "express";
import { connectDB } from "../db.js";

const router = express.Router();

router.post('/', async (req, res) =>{
    try{
        const db = await connectDB();
        const users = db.collection("users");

        const { name, email, password, phone, role } = req.body;

        if(!name || !email || !password){
            return res.status(400).json({message: "Thiếu thông tin"});
        }

        const existed = await users.findOne({ email });
        if(existed){
            return res.status(400).json({message: "Email đã tồn tại"});
        }

        const newUser = {
            name,
            email,
            password,
            phone: phone || "",
            role,
            created_at: new Date(),
        };

        await users.insertOne(newUser);

        return res.status(200).json({message: "Đăng kí thành công"});
    }catch{
        console.log(err);
        res.status(500).json({message: "Lỗi server"});
    }
});

export default router;