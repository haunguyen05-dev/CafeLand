import express from 'express';
import { connectDB } from '../db.js'; 

const router = express.Router();

router.get('/insert', async (req, res) => {
  try {
    const db = await connectDB();
    const loaitin = db.collection('loaitin');

    const doc = {
      id_loai: 10,
      ten_loai: 'Khoa học',
      thu_tu: 10,
      an_hien: false
    };

    const insertResult = await loaitin.insertOne(doc);
    res.status(200).send('Đã chèn xong. InsertedID = ' + insertResult.insertedId);

  } catch (err) {
    console.error('Lỗi:', err);
    res.status(500).send('Có lỗi xảy ra: ' + err.message);
  }
});

export default router;
