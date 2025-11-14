import express from "express";
import { connectDB } from "../db.js";
import { ObjectId } from "mongodb";

const router = express.Router();

const db = await connectDB();
const store = db.collection("stores");

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

export default router;