import express from 'express';
import Providers from './service.js'
const providers = new Providers();
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('history');
});

export default  router;
