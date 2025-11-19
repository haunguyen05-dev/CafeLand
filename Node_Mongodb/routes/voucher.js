import express from "express";
import { connectDB } from "../db.js";
import { ObjectId } from "mongodb";

const router = express.Router();

const db = await connectDB();
const vouchers = db.collection("vouchers");
const voucherUsage = db.collection("voucher_usage"); 

/*
  Schema voucher theo diagram:

  {
    _id: ObjectId,
    code: String,
    description: String,
    discount_type: String,       // 'percent' | 'fixed'
    discount_value: Number,
    min_order_amount: Number,
    max_discount_amount: Number,
    start_date: Date,
    end_date: Date,
    total_quantity: Number,      // tổng số lần phát hành
    per_user_limit: Number,      // mỗi user dùng tối đa bao nhiêu lần
    status: String,              // 'active' | 'expired' | 'disabled'
    store_id: ObjectId | null,
    used_count: Number,
    created_at: Date,
    updated_at: Date
  }
*/

// GET /vouchers/get?store_id=...
router.get("/get", async (req, res) => {
  try {
    const { store_id } = req.query;
    const filter = {};
    if (store_id) {
      filter.store_id = new ObjectId(store_id);
    }

    const result = await vouchers.find(filter).toArray();
    return res.status(200).json(result);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách voucher:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
});

// GET /vouchers/get/:id
router.get("/get/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const result = await vouchers.findOne({ _id: new ObjectId(id) });

    if (!result) {
      return res.status(404).json({ message: "Không tìm thấy voucher" });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Lỗi khi lấy voucher:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
});

// POST /vouchers/create
router.post("/create", async (req, res) => {
  try {
    const {
      code,
      description,
      discount_type,       // 'percent' | 'fixed'
      discount_value,
      min_order_amount,
      max_discount_amount,
      start_date,
      end_date,
      total_quantity,
      per_user_limit,
      status,
      store_id,
    } = req.body;

    const now = new Date();

    const doc = {
      code,
      description: description || "",
      discount_type,
      discount_value: Number(discount_value),
      min_order_amount: min_order_amount ? Number(min_order_amount) : 0,
      max_discount_amount: max_discount_amount
        ? Number(max_discount_amount)
        : 0,
      start_date: start_date ? new Date(start_date) : null,
      end_date: end_date ? new Date(end_date) : null,
      total_quantity: total_quantity ? Number(total_quantity) : 0,
      per_user_limit: per_user_limit ? Number(per_user_limit) : 1,
      status: status || "active",
      used_count: 0,
      ...(store_id && { store_id: new ObjectId(store_id) }),
      created_at: now,
      updated_at: now,
    };

    const result = await vouchers.insertOne(doc);
    return res.status(201).json({ _id: result.insertedId, ...doc });
  } catch (error) {
    console.error("Lỗi khi tạo voucher:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
});

// PUT /vouchers/update/:id
router.put("/update/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const {
      description,
      discount_type,
      discount_value,
      min_order_amount,
      max_discount_amount,
      start_date,
      end_date,
      total_quantity,
      per_user_limit,
      status,
    } = req.body;

    const updateDoc = {
      updated_at: new Date(),
    };

    if (description !== undefined) updateDoc.description = description;
    if (discount_type !== undefined) updateDoc.discount_type = discount_type;
    if (discount_value !== undefined)
      updateDoc.discount_value = Number(discount_value);
    if (min_order_amount !== undefined)
      updateDoc.min_order_amount = Number(min_order_amount);
    if (max_discount_amount !== undefined)
      updateDoc.max_discount_amount = Number(max_discount_amount);
    if (start_date !== undefined) updateDoc.start_date = new Date(start_date);
    if (end_date !== undefined) updateDoc.end_date = new Date(end_date);
    if (total_quantity !== undefined)
      updateDoc.total_quantity = Number(total_quantity);
    if (per_user_limit !== undefined)
      updateDoc.per_user_limit = Number(per_user_limit);
    if (status !== undefined) updateDoc.status = status;

    await vouchers.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: updateDoc,
      }
    );

    return res.status(200).json({ message: "Cập nhật voucher thành công" });
  } catch (error) {
    console.error("Lỗi khi cập nhật voucher:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
});

// DELETE /vouchers/delete/:id
router.delete("/delete/:id", async (req, res) => {
  try {
    const id = req.params.id;
    await vouchers.deleteOne({ _id: new ObjectId(id) });
    return res.status(200).json({ message: "Xóa voucher thành công" });
  } catch (error) {
    console.error("Lỗi khi xóa voucher:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
});

router.post("/apply", async (req, res) => {
  try {
    const { code, order_amount, user_id, store_id } = req.body;

    if (!code || !order_amount) {
      return res
        .status(400)
        .json({ success: false, message: "Thiếu mã voucher hoặc số tiền." });
    }

    const voucher = await vouchers.findOne({ code });

    if (!voucher) {
      return res
        .status(404)
        .json({ success: false, message: "Mã voucher không tồn tại." });
    }

    // trạng thái
    if (voucher.status !== "active") {
      return res
        .status(400)
        .json({ success: false, message: "Voucher không còn hiệu lực." });
    }

    const now = new Date();

    // kiểm tra ngày
    if (voucher.start_date && now < voucher.start_date) {
      return res
        .status(400)
        .json({ success: false, message: "Voucher chưa bắt đầu áp dụng." });
    }

    if (voucher.end_date && now > voucher.end_date) {
      return res
        .status(400)
        .json({ success: false, message: "Voucher đã hết hạn." });
    }

    // kiểm tra cửa hàng (nếu voucher gắn với 1 shop cụ thể)
    if (
      voucher.store_id &&
      store_id &&
      String(voucher.store_id) !== String(store_id)
    ) {
      return res.status(400).json({
        success: false,
        message: "Voucher không áp dụng cho cửa hàng này.",
      });
    }

    // đơn tối thiểu
    const orderTotal = Number(order_amount);
    if (orderTotal < (voucher.min_order_amount || 0)) {
      return res.status(400).json({
        success: false,
        message: `Đơn hàng phải tối thiểu ${voucher.min_order_amount} mới dùng được voucher.`,
      });
    }

    // giới hạn tổng số lượng
    if (
      typeof voucher.total_quantity === "number" &&
      typeof voucher.used_count === "number" &&
      voucher.total_quantity > 0 &&
      voucher.used_count >= voucher.total_quantity
    ) {
      return res.status(400).json({
        success: false,
        message: "Voucher đã được sử dụng hết.",
      });
    }

    // giới hạn mỗi user
    if (user_id && voucher.per_user_limit && voucher.per_user_limit > 0) {
      const usage = await voucherUsage.findOne({
        voucher_id: voucher._id,
        user_id,
      });

      if (usage && usage.used_count >= voucher.per_user_limit) {
        return res.status(400).json({
          success: false,
          message: "Bạn đã sử dụng voucher này tối đa số lần cho phép.",
        });
      }
    }

    // tính số tiền giảm
    let discount = 0;

    if (voucher.discount_type === "percent") {
      discount = (orderTotal * voucher.discount_value) / 100;
      if (voucher.max_discount_amount) {
        discount = Math.min(discount, voucher.max_discount_amount);
      }
    } else if (voucher.discount_type === "fixed") {
      discount = voucher.discount_value;
    }

    if (discount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Voucher không áp dụng được cho đơn này.",
      });
    }

    const finalAmount = Math.max(orderTotal - discount, 0);

    // LƯU Ý: update used_count thực tế nên làm khi tạo order thành công.
    // Ở đây chỉ demo apply → không update DB để tránh double-count.

    return res.status(200).json({
      success: true,
      discount,
      final_amount: finalAmount,
      message: "Áp dụng voucher thành công.",
      voucher_id: voucher._id,
    });
  } catch (error) {
    console.error("Lỗi khi áp dụng voucher:", error);
    return res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

export default router;
