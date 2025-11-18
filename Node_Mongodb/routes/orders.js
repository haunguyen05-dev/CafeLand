import express from 'express';
import axios from 'axios'; 
import moment from 'moment';
import { ObjectId } from 'mongodb';
import config from 'config';
import querystring from 'qs';
import crypto from 'crypto';
import { connectDB } from '../db.js'; 

const router = express.Router();
const db = await connectDB();
router.get('/', function (req, res, next) {
  res.render('orderlist', { title: 'Danh sách đơn hàng' });
});

router.get('/create_payment_url', function (req, res, next) {
  res.render('order', { title: 'Tạo mới đơn hàng', amount: 10000 });
});

router.get('/querydr', function (req, res, next) {
  let desc = 'truy van ket qua thanh toan';
  res.render('querydr', { title: 'Truy vấn kết quả thanh toán' });
});

router.get('/refund', function (req, res, next) {
  let desc = 'Hoan tien GD thanh toan';
  res.render('refund', { title: 'Hoàn tiền giao dịch thanh toán' });
});

router.post('/create_payment_url', async function (req, res, next) {
  process.env.TZ = 'Asia/Ho_Chi_Minh';

  let date = new Date();
  let createDate = moment(date).format('YYYYMMDDHHmmss');

  let ipAddr =
    req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;

  let tmnCode = config.get('vnp_TmnCode');
  let secretKey = config.get('vnp_HashSecret');
  let vnpUrl = config.get('vnp_Url');
  let returnUrl = config.get('vnp_ReturnUrl');
  let orderId = moment(date).format('DDHHmmss');
  
  // Lấy 'amount' (từ client) và 'user_id'
  const { amount, user_id } = req.body; 
  let bankCode = req.body.bankCode;

  let locale = req.body.language;
  if (locale === null || locale === '') {
    locale = 'vn';
  }
  let currCode = 'VND';
  let vnp_Params = {};
  vnp_Params['vnp_Version'] = '2.1.0';
  vnp_Params['vnp_Command'] = 'pay';
  vnp_Params['vnp_TmnCode'] = tmnCode;
  vnp_Params['vnp_Locale'] = locale;
  vnp_Params['vnp_CurrCode'] = currCode;
  vnp_Params['vnp_TxnRef'] = orderId;
  vnp_Params['vnp_OrderInfo'] = 'Thanh toan cho ma GD:' + orderId;
  vnp_Params['vnp_OrderType'] = 'other';
  // vnp_Params['vnp_Amount'] = amount * 100; // Sẽ set lại giá trị này sau khi xác thực
  vnp_Params['vnp_ReturnUrl'] = returnUrl;
  vnp_Params['vnp_IpAddr'] = ipAddr;
  vnp_Params['vnp_CreateDate'] = createDate;
  if (bankCode !== null && bankCode !== '') {
    vnp_Params['vnp_BankCode'] = bankCode;
  }

  const database = db;

  // Sửa: Dùng new ObjectId() nếu user_id trong CSDL là ObjectId
  const cart = await database.collection("carts").findOne({ user_id: new ObjectId(user_id) });

  if (!cart || !cart.items || cart.items.length === 0) {
    return res
      .status(400)
      .json({ message: 'Không tìm thấy giỏ hàng hoặc giỏ hàng trống.' });
  }
  const totalAmountInCart = cart.items.reduce(
    (sum, item) => sum + item.total_price, 0
  );

  if (amount != totalAmountInCart) { 
    return res
      .status(400)
      .json({
        message: `Tổng tiền không hợp lệ. Client gửi: ${amount} vs DB có: ${totalAmountInCart}`,
      });
  }

  const productIds = cart.items.map(item => new ObjectId(item.product_id));
  const products = await database.collection("products").find({ _id: { $in: productIds } }).toArray();
  
  const productMap = products.reduce((map, product) => {
      map[product._id.toString()] = product;
      return map;
  }, {});

  const newOrder = {
    user_id: cart.user_id,
    items: cart.items.map((item) => {
        const product = productMap[item.product_id.toString()];
        return {
            product_id: item.product_id,
            name: product ? product.name : "Sản phẩm không rõ", 
            price: product ? product.price : 0, 
            quantity: item.quantity,
            total_price: item.total_price 
        };
    }),
    status: 0, 
    total_amount: totalAmountInCart, 
    create_at: new Date(),
  };
  
  const result = await database.collection('orders').insertOne(newOrder);

  if (result) {
    vnp_Params['vnp_TxnRef'] = String(result.insertedId);
  }
  
  vnp_Params['vnp_Amount'] = totalAmountInCart * 100;

  vnp_Params = sortObject(vnp_Params);

  let signData = querystring.stringify(vnp_Params, { encode: false });
  let hmac = crypto.createHmac('sha512', secretKey);
  let signed = hmac.update(Buffer.from(signData, 'utf8')).digest('hex');

  vnp_Params['vnp_SecureHash'] = signed;
  vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });

  res.json({ paymentUrl: vnpUrl });
});

router.get('/vnpay_return', async function (req, res) {
  let vnp_Params = req.query;
  let secureHash = vnp_Params['vnp_SecureHash'];

  delete vnp_Params['vnp_SecureHash'];
  delete vnp_Params['vnp_SecureHashType'];

  vnp_Params = sortObject(vnp_Params);

  let secretKey = config.get('vnp_HashSecret');

  let signData = querystring.stringify(vnp_Params, { encode: false });
  let hmac = crypto.createHmac('sha512', secretKey);
  let signed = hmac.update(Buffer.from(signData, 'utf8')).digest('hex');

  if (secureHash === signed) {
    const database = db;
    const orderId = req.query.vnp_TxnRef;
    const _id = new ObjectId(orderId);

    const order = await database.collection("orders").findOne({ _id });

    if (order) {

      // Cập nhật trạng thái order
      await database.collection("orders").updateOne(
        { _id },
        { $set: { status: 1 } }
      );

      // Xóa giỏ hàng đúng cách
      await database.collection("carts").deleteOne({
        user_id: new ObjectId(order.user_id)
      });

    }

    return res.redirect(
      'http://localhost:5173/vnpay_return?' +
      querystring.stringify(vnp_Params, { encode: false })
    );
  }

  return res.redirect('http://localhost:5173/vnpay_return?vnp_ResponseCode=97');
});


router.get('/vnpay_ipn', function (req, res, next) {
    let vnp_Params = req.query;
    let secureHash = vnp_Params['vnp_SecureHash'];
    
    let orderId = vnp_Params['vnp_TxnRef'];
    let rspCode = vnp_Params['vnp_ResponseCode'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = sortObject(vnp_Params);
    let config = require('config');
    let secretKey = config.get('vnp_HashSecret');
    let querystring = require('qs');
    let signData = querystring.stringify(vnp_Params, { encode: false });
    let crypto = require("crypto");     
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex");     
    
    let paymentStatus = '0'; // Giả sử '0' là trạng thái khởi tạo giao dịch, chưa có IPN. Trạng thái này được lưu khi yêu cầu thanh toán chuyển hướng sang Cổng thanh toán VNPAY tại đầu khởi tạo đơn hàng.
    //let paymentStatus = '1'; // Giả sử '1' là trạng thái thành công bạn cập nhật sau IPN được gọi và trả kết quả về nó
    //let paymentStatus = '2'; // Giả sử '2' là trạng thái thất bại bạn cập nhật sau IPN được gọi và trả kết quả về nó
    
    let checkOrderId = true; // Mã đơn hàng "giá trị của vnp_TxnRef" VNPAY phản hồi tồn tại trong CSDL của bạn
    let checkAmount = true; // Kiểm tra số tiền "giá trị của vnp_Amout/100" trùng khớp với số tiền của đơn hàng trong CSDL của bạn
    if(secureHash === signed){ //kiểm tra checksum
        if(checkOrderId){
            if(checkAmount){
                if(paymentStatus=="0"){ //kiểm tra tình trạng giao dịch trước khi cập nhật tình trạng thanh toán
                    if(rspCode=="00"){
                        //thanh cong
                        //paymentStatus = '1'
                        // Ở đây cập nhật trạng thái giao dịch thanh toán thành công vào CSDL của bạn
                        res.status(200).json({RspCode: '00', Message: 'Success'})
                    }
                    else {
                        //that bai
                        //paymentStatus = '2'
                        // Ở đây cập nhật trạng thái giao dịch thanh toán thất bại vào CSDL của bạn
                        res.status(200).json({RspCode: '00', Message: 'Success'})
                    }
                }
                else{
                    res.status(200).json({RspCode: '02', Message: 'This order has been updated to the payment status'})
                }
            }
            else{
                res.status(200).json({RspCode: '04', Message: 'Amount invalid'})
            }
        }       
        else {
            res.status(200).json({RspCode: '01', Message: 'Order not found'})
        }
    }
    else {
        res.status(200).json({RspCode: '97', Message: 'Checksum failed'})
    }
});

// SỬA LẠI /querydr DÙNG AXIOS
router.post('/querydr', async function (req, res, next) {
  process.env.TZ = 'Asia/Ho_Chi_Minh';
  let date = new Date();

  let vnp_TmnCode = config.get('vnp_TmnCode');
  let secretKey = config.get('vnp_HashSecret');
  let vnp_Api = config.get('vnp_Api');

  let vnp_TxnRef = req.body.orderId;
  let vnp_TransactionDate = req.body.transDate;

  let vnp_RequestId = moment(date).format('HHmmss');
  let vnp_Version = '2.1.0';
  let vnp_Command = 'querydr';
  let vnp_OrderInfo = 'Truy van GD ma:' + vnp_TxnRef;

  let vnp_IpAddr =
    req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;

  let currCode = 'VND';
  let vnp_CreateDate = moment(date).format('YYYYMMDDHHmmss');

  let data =
    vnp_RequestId +
    '|' +
    vnp_Version +
    '|' +
    vnp_Command +
    '|' +
    vnp_TmnCode +
    '|' +
    vnp_TxnRef +
    '|' +
    vnp_TransactionDate +
    '|' +
    vnp_CreateDate +
    '|' +
    vnp_IpAddr +
    '|' +
    vnp_OrderInfo;

  let hmac = crypto.createHmac('sha512', secretKey);
  let vnp_SecureHash = hmac.update(Buffer.from(data, 'utf-8')).digest('hex');

  let dataObj = {
    vnp_RequestId: vnp_RequestId,
    vnp_Version: vnp_Version,
    vnp_Command: vnp_Command,
    vnp_TmnCode: vnp_TmnCode,
    vnp_TxnRef: vnp_TxnRef,
    vnp_OrderInfo: vnp_OrderInfo,
    vnp_TransactionDate: vnp_TransactionDate,
    vnp_CreateDate: vnp_CreateDate,
    vnp_IpAddr: vnp_IpAddr,
    vnp_SecureHash: vnp_SecureHash,
  };

  try {
    const response = await axios.post(vnp_Api, dataObj);
    console.log(response.data); // Dùng response.data với axios
  } catch (error) {
    console.error("Lỗi khi gọi VNPAY API (querydr):", error.message);
  }
});

// SỬA LẠI /refund DÙNG AXIOS
router.post('/refund', async function (req, res, next) {
  process.env.TZ = 'Asia/Ho_Chi_Minh';
  let date = new Date();

  let vnp_TmnCode = config.get('vnp_TmnCode');
  let secretKey = config.get('vnp_HashSecret');
  let vnp_Api = config.get('vnp_Api');

  let vnp_TxnRef = req.body.orderId;
  let vnp_TransactionDate = req.body.transDate;
  let vnp_Amount = req.body.amount * 100;
  let vnp_TransactionType = req.body.transType;
  let vnp_CreateBy = req.body.user;

  let currCode = 'VND';

  let vnp_RequestId = moment(date).format('HHmmss');
  let vnp_Version = '2.1.0';
  let vnp_Command = 'refund';
  let vnp_OrderInfo = 'Hoan tien GD ma:' + vnp_TxnRef;

  let vnp_IpAddr =
    req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;

  let vnp_CreateDate = moment(date).format('YYYYMMDDHHmmss');

  let vnp_TransactionNo = '0';

  let data =
    vnp_RequestId +
    '|' +
    vnp_Version +
    '|' +
    vnp_Command +
    '|' +
    vnp_TmnCode +
    '|' +
    vnp_TransactionType +
    '|' +
    vnp_TxnRef +
    '|' +
    vnp_Amount +
    '|' +
    vnp_TransactionNo +
    '|' +
    vnp_TransactionDate +
    '|' +
    vnp_CreateBy +
    '|' +
    vnp_CreateDate +
    '|' +
    vnp_IpAddr +
    '|' +
    vnp_OrderInfo;
  let hmac = crypto.createHmac('sha512', secretKey);
  let vnp_SecureHash = hmac.update(Buffer.from(data, 'utf-8')).digest('hex');

  let dataObj = {
    vnp_RequestId: vnp_RequestId,
    vnp_Version: vnp_Version,
    vnp_Command: vnp_Command,
    vnp_TmnCode: vnp_TmnCode,
    vnp_TransactionType: vnp_TransactionType,
    vnp_TxnRef: vnp_TxnRef,
    vnp_Amount: vnp_Amount,
    vnp_TransactionNo: vnp_TransactionNo,
    vnp_CreateBy: vnp_CreateBy,
    vnp_OrderInfo: vnp_OrderInfo,
    vnp_TransactionDate: vnp_TransactionDate,
    vnp_CreateDate: vnp_CreateDate,
    vnp_IpAddr: vnp_IpAddr,
    vnp_SecureHash: vnp_SecureHash,
  };

  try {
    const response = await axios.post(vnp_Api, dataObj);
    console.log(response.data); // Dùng response.data với axios
  } catch (error) {
    console.error("Lỗi khi gọi VNPAY API (refund):", error.message);
  }
});

// --- HÀM SORT (Không đổi) ---
function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, '+');
  }
  return sorted;
}

// 4. Chuyển đổi 'module.exports' sang 'export default'
export default router;