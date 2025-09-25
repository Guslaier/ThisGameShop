import express from 'express';
import Providers from './service.js'
const providers = new Providers();
var router = express.Router();

/* GET home page. */
router.get('/stock', function(req, res, next) {
  res.render('index');
});

export default  router;
