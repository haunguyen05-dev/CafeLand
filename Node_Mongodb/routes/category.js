import express from 'express';
import { connectDB } from '../db.js'; 

const router = express.Router();

const db = await connectDB();
const category = db.collection('categories');

router.get('/get', async (req, res) => {
  try {
    const result = await category.find({}).toArray();
    res.json(result);
  } catch (error) {
    console.error('Lỗi khi lấy danh mục:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

export default router;
