import express from 'express';
import Providers from './service.js'
const providers = new Providers();
var router = express.Router();
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index',{ activePage: 'home' });
});
router.get('/no-access', (req, res) => {
  res.render('no-access', {
    title: 'Access Denied',
    message: 'คุณไม่มีสิทธิ์เข้าถึงหน้านี้ 😢',
    user: req.session.user || null
  });
});
export default  router;
