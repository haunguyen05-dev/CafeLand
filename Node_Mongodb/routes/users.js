import express from 'express';

const router = express.Router();

/* GET users listing. */
router.get('/', (req, res) => {
  res.send('respond with a resource');
});

// ✅ Xuất router chuẩn ESM
export default router;
