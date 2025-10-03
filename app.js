import createError from'http-errors';
import express from 'express';
import session from "express-session";
import path from'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import { fileURLToPath } from 'url';
import ejs from 'ejs'
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

import accountpage from './routes/account/controller.js';
import cartpage from './routes/cart/controller.js';
import indexpage from './routes/indexpage.js';
import historypage from './routes/history/controller.js';
import storepage from './routes/store/controller.js';

app.use('/', indexpage);
app.use('/store', storepage);
app.use('/cart', cartpage);
app.use('/account', accountpage);
app.use('/history', historypage);


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
  res.render('error');
});

export default app;
