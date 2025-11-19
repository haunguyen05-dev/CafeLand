import express from 'express';
import { ObjectId } from 'mongodb';
import { connectDB } from '../db.js';

const router = express.Router();
const db = await connectDB();
const cart = db.collection('carts');

router.get('/get/:user_id', async (req, res) => {
  try {
    const user_id = req.params.user_id;
    const results = await cart.find({ user_id: new ObjectId(user_id) }).toArray();

    return res.status(200).json(results);
  } catch (error) {
    console.error('Lỗi khi lấy giỏ hàng:', error);
    return res.status(500).json({ message: 'Lỗi server khi lấy giỏ hàng.' });
  }
});

router.post('/add', async (req, res) => {
  try {
    const { user_id, product_id, quantity, total_price } = req.body;

    if (!user_id || !product_id || !quantity || !total_price) {
      return res.status(400).json({
        message: 'Thiếu dữ liệu trong body.',
      });
    }

    const userObjectId = new ObjectId(user_id);
    const productObjectId = new ObjectId(product_id);

    const existingCart = await cart.findOne({ user_id: userObjectId });

    if (existingCart) {
      const existingItem = existingCart.items.find(
        (item) => item.product_id.toString() === productObjectId.toString()
      );

      if (existingItem) {
        await cart.updateOne(
          { user_id: userObjectId, 'items.product_id': productObjectId },
          {
            $inc: { 'items.$.quantity': quantity, 'items.$.total_price': total_price },
          }
        );
      } else {
        await cart.updateOne(
          { user_id: userObjectId },
          {
            $push: {
              items: {
                product_id: productObjectId,
                quantity,
                total_price,
              },
            },
          }
        );
      }
    } else {
      await cart.insertOne({
        user_id: userObjectId,
        items: [
          {
            product_id: productObjectId,
            quantity,
            total_price,
          },
        ],
        created_at: new Date(),
      });
    }

    return res.status(200).json({
      message: 'Đã thêm sản phẩm vào giỏ hàng.',
    });
  } catch (error) {
    console.error('Lỗi khi thêm vào giỏ hàng:', error);
    return res.status(500).json({
      message: 'Lỗi server khi thêm sản phẩm vào giỏ hàng.',
    });
  }
});

router.delete('/remove', async (req, res) => {
  try {
    const { user_id, product_id } = req.body;
    if (!user_id || !product_id) {
      return res.status(400).json({ message: 'Thiếu dữ liệu trong body.' });
    }
    const userObjectId = new ObjectId(user_id);
    const productObjectId = new ObjectId(product_id);   
    await cart.updateOne(
      { user_id: userObjectId },
      { $pull: { items: { product_id: productObjectId } } }
    );
    return res.status(200).json({ message: 'Đã xóa sản phẩm khỏi giỏ hàng.' });
  } catch (error) {
    console.error('Lỗi khi xóa sản phẩm khỏi giỏ hàng:', error);
    return res.status(500).json({ message: 'Lỗi server khi xóa sản phẩm khỏi giỏ hàng.' });
  }
});

export default router;
