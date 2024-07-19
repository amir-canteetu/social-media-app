import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
  res.send('Hello, secure and logged in!!!!');
});

export default router;
