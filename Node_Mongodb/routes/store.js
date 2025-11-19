import express from "express";
import { connectDB } from "../db.js";
import { ObjectId } from "mongodb";

const router = express.Router();

const db = await connectDB();
const store = db.collection("stores");

router.get("/get", async (req, res) => {
  try {
    const result = await store.find({}).toArray();
    return res.status(200).json(result);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách cửa hàng:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
});

router.get("/get/:id", async (req, res) => {
    try {
        const store_id = await req.params.id;
        const result = await store.findOne({ _id: new ObjectId(store_id) });

        if(!result) {res.json({ message: "Không tìm thấy cửa hàng"})}
        res.json(result);
    } catch (error) {
        return res.status(500).json({ message: "" })
    }
});

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
    const result = await store.insertOne(doc);
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

    await store.updateOne(
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

router.delete("/delete/:id", async (req, res) => {
  try {
    const id = req.params.id;
    await store.deleteOne({ _id: new ObjectId(id) });
    return res.status(200).json({ message: "Xóa cửa hàng thành công" });
  } catch (error) {
    console.error("Lỗi khi xóa cửa hàng:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
});

export default router;