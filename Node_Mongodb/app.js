import express from "express";
import cors from "cors";
import morgan from "morgan";

import indexRouter from "./routes/index.js";
import productRouter from "./routes/product.js";
import categoryRouter from "./routes/category.js";
import storeRouter from "./routes/store.js";
import cartRouter from "./routes/cart.js";
import userRouter from "./routes/users.js";
import voucherRouter from "./routes/voucher.js"; // <- DÒNG NÀY QUAN TRỌNG

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan("dev"));

// mount routes
app.use("/", indexRouter);
app.use("/products", productRouter);
app.use("/categories", categoryRouter);
app.use("/stores", storeRouter);
app.use("/carts", cartRouter);
app.use("/users", userRouter);
app.use("/vouchers", voucherRouter); 

app.use((req, res, next) => {
  res.status(404).send('Không tìm thấy trang');
});

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.send(err.message);
});

export default app;
