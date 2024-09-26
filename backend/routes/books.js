const express = require('express');
const router = express.Router();

const auth = require ('../middlewares/auth');
const multer = require('../middlewares/multer-config');

const booksCtrl = require ('../controllers/books');

router.get('/', booksCtrl.getAllBooks);
router.post('/', auth, multer, booksCtrl.createBook);
router.post('/:id/rating', auth, booksCtrl.addRating);
router.get('/:id', booksCtrl.getOneBook);
router.put('/:id', auth, multer, booksCtrl.modifyBook);
router.delete('/:id', auth, booksCtrl.deleteBook);

module.exports = router;