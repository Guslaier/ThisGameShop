import createError from'http-errors';
import express from 'express';
import session from "express-session";
import path from'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import { fileURLToPath } from 'url';
import ejs from 'ejs'
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
import livereload from "livereload";
import connectLiveReload from "connect-livereload";

const liveReloadServer = livereload.createServer();
liveReloadServer.server.once("connection", () => {
  setTimeout(() => {
    liveReloadServer.refresh(".");
  }, 100);
});
app.use(session({
  secret: "mySecretKey",     // ใช้ string ลับสำหรับ sign cookie
  resave: false,             // ไม่บันทึกซ้ำถ้าไม่มีการแก้ไข
  saveUninitialized: false,  // ไม่สร้าง session ถ้าไม่ใช้งาน
  cookie: { 
    maxAge: 1000 * 60 * 60,  // อายุ cookie 1 ชั่วโมง
    httpOnly: true           // ปลอดภัยกว่า ปิดการเข้าถึงจาก client JS
  }
}));

app.use(connectLiveReload());
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('html', ejs.renderFile);
app.set('view engine', 'html');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

import accountpage from './routes/account/router.js';
import cartpage from './routes/cart/router.js';
import indexpage from './routes/indexpage.js';
import orderpage from './routes/order/router.js';
import storepage from './routes/store/router.js';
import adminpage from './routes/admin/router.js';
import stockpage from './routes/stock/router.js';
import Librarypage from './routes/library/router.js';
import gamedetailpage from './routes/gamedetail/router.js'


// app.use((req, res, next) => {
//   if (!req.session.user) { 
//     if (!(req.path === '/' || 
//       req.path === '/store' || 
//       req.path === '/account/' || 
//       req.path === '/account/login' || 
//       req.path === '/account/register' ||
//       req.path === '/account/register-sum' ||
//       req.path === '/account/session' ||
//       req.path === '/admin' )) {
//       return res.redirect('/account/');
//     }
//   }
//   next();
// });
app.use('/', indexpage);
app.use('/store', storepage);
app.use('/cart', cartpage);
app.use('/account', accountpage);
app.use('/order', orderpage);
app.use('/ad-m', adminpage);
app.use('/stock', stockpage);
app.use('/lib',Librarypage);
app.use('/gamedetail', gamedetailpage);

app.use(cors({
  origin: "http://localhost:3000", // หรือ domain ของคุณ
  credentials: true
}));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error',{
    message: err.message,
    error: err // ← ต้องส่งตัวนี้มาด้วย
  });
});

export default app;
