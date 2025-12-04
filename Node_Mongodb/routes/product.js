import express from "express";
import { connectDB } from "../db.js";
import { ObjectId } from "mongodb";

const router = express.Router();

const db = await connectDB();
const product = db.collection("products");

router.get("/get", async (req, res) => {
  try {
    const result = await product.find({}).toArray();
    res.json(result);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách sản phẩm:", error);
    res.status(500).json({ error: "Lỗi server" });
  }
});

router.get("/get/:id", async (req, res) => {
  try {
    const product_id = req.params.id;
    const result = await product.findOne({ _id: new ObjectId(product_id) });

    if (!result) {
      return res.status(404).json({ error: "Không tìm thấy sản phẩm" });
    }

    res.json(result);
  } catch (error) {
    console.error("Lỗi khi tìm sản phẩm:", error);
    res.status(500).json({ error: "Lỗi server" });
  }
});

router.post("/add", async (req, res) => {
  try {
    const {store_id, name, description, price, category_id, quantity, status, images} = req.body;
    const newProduct = {product_id: new ObjectId(), store_id: new ObjectId(store_id), name, description, price: Number(price), category_id: new ObjectId(category_id), quantity: Number(quantity), status: status || "active", created_at: new Date(), images: images || [],
    };

    await product.insertOne(newProduct);
    res.status(201).json({ message: "Thêm sản phẩm thành công!", product: newProduct });
  } catch (error) {
    console.error("Lỗi khi thêm sản phẩm:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

router.put("/update/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const { name, description, price, category_id, quantity, status } = req.body;

    const updateData = {
      name,
      description,
      price: Number(price),
      category_id: new ObjectId(category_id),
      quantity: Number(quantity),
      status
    };

    const result = await product.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0)
      return res.status(404).json({ message: "Không tìm thấy sản phẩm để cập nhật" });

    res.json({ message: "Cập nhật sản phẩm thành công!" });
  } catch (error) {
    console.error("Lỗi khi cập nhật sản phẩm:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
});

router.delete("/delete/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const result = await product.deleteOne({ _id: ObjectId(id) });

    if (result.deletedCount === 0)
      return res.status(404).json({ message: "Không tìm thấy sản phẩm để xóa" });

    res.json({ message: "Xóa sản phẩm thành công!" });
  } catch (error) {
    console.error("Lỗi khi xóa sản phẩm:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

router.get('/category/:id', async (req, res) => {
  try {
    const categoryId = req.params.id;
    const result = await product.find({ category_id: new ObjectId(categoryId) }).toArray();

    res.json(result);
  } catch (error) {
    console.error('Lỗi khi lọc sản phẩm theo category:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

router.get('/store/:id', async (req, res) => {
  try {
    const storeId = req.params.id;
    const result = await product.find({ store_id: new ObjectId(storeId) }).toArray();

    res.json(result)
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server' });
  }
});

router.get('/images/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const result = await product.find({ _id: new ObjectId(productId)}).toArray();

    if (!result || result.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy sản phẩm' });
    }

    res.json({
      images: result[0].images || []
    });
  } catch (error) {
    console.error('Lỗi khi lấy ảnh sản phẩm:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

router.get('/product/cart/:userId', async function(req, res){
  const database = await db();
  const cart = database.collection('carts')
  const result = await cart.findOne({user_id: req.params.userId});
  res.json({cart: result});
})
export default router;
