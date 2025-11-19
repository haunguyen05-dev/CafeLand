// Node_Mongodb/routes/store.js
import express from "express";
import { connectDB } from "../db.js";
import { ObjectId } from "mongodb";

const router = express.Router();

const db = await connectDB();
const stores = db.collection("stores");

// GET tất cả cửa hàng
router.get("/get", async (req, res) => {
  try {
    const result = await stores.find({}).toArray();
    return res.status(200).json(result);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách cửa hàng:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
});

// GET 1 shop
router.get("/get/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const result = await stores.findOne({ _id: new ObjectId(id) });
    if (!result) return res.status(404).json({ message: "Không tìm thấy shop" });
    return res.status(200).json(result);
  } catch (error) {
    console.error("Lỗi khi lấy cửa hàng:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
});

// POST /stores/create  — thêm shop
router.post("/create", async (req, res) => {
  try {
    const { name, address, phone, status } = req.body;
    const doc = {
      name,
      address: address || "",
      phone: phone || "",
      status: status || "pending", // pending | active | banned
      created_at: new Date(),
    };
    const result = await stores.insertOne(doc);
    return res.status(201).json({ _id: result.insertedId, ...doc });
  } catch (error) {
    console.error("Lỗi khi tạo cửa hàng:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
});

// PUT /stores/update/:id — sửa shop
router.put("/update/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const { name, address, phone, status } = req.body;

    await stores.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...(name && { name }),
          ...(address && { address }),
          ...(phone && { phone }),
          ...(status && { status }),
          updated_at: new Date(),
        },
      }
    );

    return res.status(200).json({ message: "Cập nhật cửa hàng thành công" });
  } catch (error) {
    console.error("Lỗi khi cập nhật cửa hàng:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
});

// DELETE /stores/delete/:id — xóa shop
router.delete("/delete/:id", async (req, res) => {
  try {
    const id = req.params.id;
    await stores.deleteOne({ _id: new ObjectId(id) });
    return res.status(200).json({ message: "Xóa cửa hàng thành công" });
  } catch (error) {
    console.error("Lỗi khi xóa cửa hàng:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
});

export default router;
