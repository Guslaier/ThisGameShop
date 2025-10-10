import express from 'express';
import Providers from './service.js';
import Authentication from '../authentication.js';

const providers = new Providers();
const { isAuthenticated } = Authentication;
const router = express.Router();

router.get('/', async (req, res) => {
  res.render('store', { activePage: 'store' });
});


export default router;
