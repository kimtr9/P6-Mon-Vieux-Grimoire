const Book = require ('../models/Book');
const fs = require ('fs');
const sharp = require('sharp');

exports.createBook = (req, res, next) => {
    const bookObject = JSON.parse(req.body.book);
    delete bookObject._id;
    delete bookObject._userId;

    if (req.file) {
        const buffer = req.file.buffer;
        const imagePath = `images/${Date.now()}_${req.file.originalname}`;
    
        sharp(buffer)
          .resize(500, {fit: sharp.fit.cover})
          .toFormat('webp', {quality: 80})
          .toFile(imagePath)
          .then(() => {
            const book = new Book ({
                ...bookObject,
                userId: req.auth.userId,
                imageUrl: `${req.protocol}://${req.get('host')}/${imagePath}`
            });
            return book.save();
          })
          .then(() => res.status(201).json({ message: 'Livre enregistré' }))
          .catch(error => res.status(400).json({ error }));
    } else {
        const book = new Book ({
            ...bookObject,
            userId: req.auth.userId
        });
        book.save()
          .then(() => {res.status(201).json({message: 'Livre enregistré'})})
          .catch(error => {res.status(400).json({error})})
    }
};

exports.getOneBook = (req, res, next) => {
    const bookObject = req.file ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://$req.get('host')}/images/${req.file.filename}`
    } : { ...req.body};
    delete bookObject._userId;
    Book.findOne({_id: req.params.id})
       .then((book) => {
        if (book.userId !=req.auth.userId) {
            res.status(401).json({message: 'Non-autorisé'})
        } else {
            Book.update({_id: req.params.id}, { ...bookObject, _id: req.params.id})
            .then(() => res.status(200).json({message : 'Livre modifié!'}))
            .catch(error => res.status(401).json({ error }));
        }
        })
};

exports.addRating = async (req, res, next) => {
    try {
        const { userId, grade } = req.body;
        const book = Book.findById(req.params.id);
        if (!book) {
          return res.status(404).json({ message: 'Livre non trouvé' });
        }
        //Vérifivcation qu'il n'y a pas déjà une note de ce user
        const existingRating = book.ratings.find(rat => rat.userId.toString() === userId);
        if (existingRating) {
          return res.status(400).json({ message: 'Vous avez déjà noté ce livre' });
        }
    book.ratings.push({ userId, grade });

    // Novelle note moyenne
    const totalRatings = book.ratings.length;
    const sumRatings = book.ratings.reduce((acc, rating) => acc + rating.grade, 0);
    book.averageRating = sumRatings / totalRatings;

    await book.save();

    res.status(201).json({ message: 'Notation ajoutée', averageRating: book.averageRating });
    } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};

exports.modifyBook = (req, res, next) => {
    const bookObject = req.file ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
  
    delete bookObject._userId;
    Book.findOne({_id: req.params.id})
        .then((book) => {
            if (book.userId != req.auth.userId) {
                res.status(401).json({ message : 'Not authorized'});
            } else {
                Book.updateOne({ _id: req.params.id}, { ...bookObject, _id: req.params.id})
                .then(() => res.status(200).json({message : 'Livre modifié!'}))
                .catch(error => res.status(401).json({ error }));
            }
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
 }; 

 exports.deleteBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id})
        .then(book => {
            if (book.userId != req.auth.userId) {
                res.status(401).json({message: 'Not authorized'});
            } else {
                const filename = book.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Book.deleteOne({_id: req.params.id})
                        .then(() => { res.status(200).json({message: 'Livre supprimé !'})})
                        .catch(error => res.status(401).json({ error }));
                });
            }
        })
        .catch( error => {
            res.status(500).json({ error });
        });
 };

exports.getAllBooks =  (req, res, next) => {
    Book.find()
      .then(books => res.status(200).json(books))
      .catch(error => res.status(400).json({ error }));
};

