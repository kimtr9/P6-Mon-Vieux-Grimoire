const multer = require('multer');

const storage = multer.memoryStorage();

const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
};

const upload = multer({
    storage: storage,
    fileFilter: (req, file, callback) => {
      const isValid = !!MIME_TYPES[file.mimetype];
      const error = isValid ? null : new Error ('Type de fichier non pris en charge')
      callback(error, isValid)
    },
  });

module.exports = upload.single('image');