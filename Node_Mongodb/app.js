import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import cors from 'cors';

import indexRouter from './routes/index.js';
import usersRouter from './routes/users.js';
import product from './routes/product.js';
import category from './routes/category.js';
import store from './routes/store.js';
import cart from './routes/cart.js';

import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/products', product);
app.use('/categories', category);
app.use('/stores', store);
app.use('/carts', cart);

app.use((req, res, next) => {
  res.status(404).send('Không tìm thấy trang');
});

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.send(err.message);
});

export default app;
