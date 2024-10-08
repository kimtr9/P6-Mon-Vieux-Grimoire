const express = require('express');
const router = express.Router();

const auth = require ('../middlewares/auth');
const multer = require('../middlewares/multer-config');

const booksCtrl = require ('../controllers/books');

router.get('/bestrating', booksCtrl.getBestRatedBooks);
router.get('/:id', booksCtrl.getOneBook);
router.get('/', booksCtrl.getAllBooks);

router.post('/:id/rating', auth, booksCtrl.addRating);
router.post('/', auth, multer, booksCtrl.createBook);

router.put('/:id', auth, multer, booksCtrl.modifyBook);
router.delete('/:id', auth, booksCtrl.deleteBook);

module.exports = router;