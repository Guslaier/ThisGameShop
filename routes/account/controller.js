import express from 'express';
import Providers from './service.js'
import e from 'express';
const providers = new Providers();
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('login', { title: 'Login' });
});
/* GET home page. */
router.post('/register', async function (req, res, next) {
  const { email, password, display_name } = req.body;
  const user = await providers.getUserByEmail(email);
  if (user.length > 0) {
    return res.status(400).json({ message: 'Email already registered' ,status: false});
  }

  if (!email || !password || password.length < 6) {
    return res.status(400).json({ message: 'Invalid email or password',status: false});
  }

  const newUser = await providers.register(email, password, display_name);
  const updatedUser = await providers.setUserRole(newUser.rows[0].id, 'user');

  res.json(updatedUser[0]);
});

router.post('/login', async function (req, res, next) {
  const { email, password } = req.body;
  const user = await providers.login(email, password);
  if (user.rowCount > 0) {
    req.session.user = {
      id: user.rows[0].id,
      email: user.rows[0].email,
      display_name: user.rows[0].display_name,
      role: user.rows[0].role
    };
    res.json({ message: 'Login successful', user: req.session.user ,status: true});
  } else {
    res.status(401).json({ message: 'Invalid email or password',status: false });
  }


  router.get('/logout', function (req, res, next) {
    req.session.destroy();
    res.json({ message: 'Logout successful' });
  });

  router.get('/profile', async function (req, res, next) {
    const user = await providers.getUserById(req.session.user.id);
    res.json(user[0]);
  });

  router.get('/list', async function (req, res, next) {
    const users = await providers.listUsers();
    console.log(users.rows);
    res.json(users.rows);
  });

  router.post('/update', async function (req, res, next) {
    const { display_name, password } = req.body;
    if (display_name) {
      let user = await providers.updateUser(req.session.user.id, display_name);
      res.json(user[0]);
    }
    if (password && password.length >= 6) {
      let user = await providers.updatePassword(req.session.user.id, password);
      res.json(user[0]);
    }
    if (!display_name && (!password || password.length < 6)) {
      res.status(400).json({ message: 'No valid fields to update' ,status: false});
    }

  });

  router.post('/delete', async function (req, res, next) {
    await providers.deleteUser(req.session.user.id);
    req.session.destroy();
    res.json({ message: 'Account deleted' ,status: true});
  });
});
export default router;
