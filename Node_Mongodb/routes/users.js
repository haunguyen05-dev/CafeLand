import express from "express";
import { connectDB } from "../db.js";
import { ObjectId } from "mongodb";

const router = express.Router();
const db = await connectDB();
const users = db.collection("users");

/*
  user/admin schema gợi ý:
  {
    _id: ObjectId,
    name: String,
    email: String,
    password: String,
    phone: String,
    role: String,        // 'admin' | 'seller' | 'customer'
    status: String,      // 'active' | 'banned'
    created_at: Date,
    updated_at: Date
  }
*/

// GET /users/get
router.get("/get", async (req, res) => {
  try {
    const result = await users.find({}).toArray();
    return res.status(200).json(result);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách user:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
});

// GET /users/get/:id
router.get("/get/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const result = await users.findOne({ _id: new ObjectId(id) });
    if (!result) {
      return res.status(404).json({ message: "Không tìm thấy user" });
    }
    return res.status(200).json(result);
  } catch (error) {
    console.error("Lỗi khi lấy user:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
});

// POST /users/create — thêm user/admin
router.post("/create", async (req, res) => {
  try {
    const { name, email, password, phone, role, status } = req.body;

    const now = new Date();
    const doc = {
      name,
      email,
      password: password || "",
      phone: phone || "",
      role: role || "customer",
      status: status || "active",
      created_at: now,
      updated_at: now,
    };

    const result = await users.insertOne(doc);
    return res.status(201).json({ _id: result.insertedId, ...doc });
  } catch (error) {
    console.error("Lỗi khi tạo user:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
});

// PUT /users/update/:id — sửa user
router.put("/update/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const { name, email, password, phone, role, status } = req.body;

    const updateDoc = {
      updated_at: new Date(),
    };

    if (name !== undefined) updateDoc.name = name;
    if (email !== undefined) updateDoc.email = email;
    if (password !== undefined) updateDoc.password = password;
    if (phone !== undefined) updateDoc.phone = phone;
    if (role !== undefined) updateDoc.role = role;
    if (status !== undefined) updateDoc.status = status;

    await users.updateOne({ _id: new ObjectId(id) }, { $set: updateDoc });

    return res.status(200).json({ message: "Cập nhật user thành công" });
  } catch (error) {
    console.error("Lỗi khi cập nhật user:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
});

// DELETE /users/delete/:id — xóa user
router.delete("/delete/:id", async (req, res) => {
  try {
    const id = req.params.id;
    await users.deleteOne({ _id: new ObjectId(id) });
    return res.status(200).json({ message: "Xóa user thành công" });
  } catch (error) {
    console.error("Lỗi khi xóa user:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
});

export default router;
