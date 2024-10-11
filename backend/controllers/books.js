const Book = require ('../models/Book');
const fs = require ('fs');
const {imageHandler} = require ('../middlewares/sharp-config')

exports.createBook = async (req, res, next) => {
    try {
        const bookObject = JSON.parse(req.body.book);
        delete bookObject._id;
        delete bookObject._userId;

        if (req.file) {
            const webpFileName = `${req.file.filename.split('.')[0]}.webp`; // Création d'un nom de fichier pour le WebP
            const webpFilePath = `images/${webpFileName}`;

            // Appel de processImage pour gérer la conversion et la suppression
            await imageHandler(req.file.path, webpFilePath)

            // Sauvegarder le livre avec l'image formatée
            const book = new Book({
                ...bookObject,
                userId: req.auth.userId,
                imageUrl: `${req.protocol}://${req.get('host')}/${webpFilePath}`
            });
            await book.save();
            return res.status(201).json({ message: 'Livre enregistré' });
        } else {
            const book = new Book({
                ...bookObject,
                userId: req.auth.userId
            });
            await book.save()
            return res.status(201).json({ message: 'Livre enregistré' });
        }   
    } catch (error) {
        console.error('Erreur dans createBook:', error);
        res.status(500).json({ error });
    }
    };

exports.getOneBook = (req, res, next) => {
    Book.findOne({_id: req.params.id})
       .then((book) => {
           if (!book) {
            res.status(401).json({message: 'Livre non trouvé'})
           }
           res.status(200).json(book)
        })
        .catch(error => res.status(400).json({error}))
};

exports.addRating = async (req, res, next) => {
    try {
      const { userId, rating } = req.body;
      const book = await Book.findById(req.params.id);
  
      if (!book) {
        return res.status(404).json({ message: 'Livre non trouvé' });
      }
      // Vérification qu'il n'y a pas déjà une note de cet utilisateur
      const existingRating = book.ratings.find(rat => rat.userId.toString() === userId);
      if (existingRating) {
        return res.status(400).json({ message: 'Vous avez déjà noté ce livre' });
      }
  
      // Ajout nouvelle note au tableau des ratings
      book.ratings.push({ userId, grade: rating, bookId: book._id });
  
      // Nouvelle note moyenne
      const totalRatings = book.ratings.length;
      const sumRatings = book.ratings.reduce((acc, rating) => acc + rating.grade, 0);
      book.averageRating = totalRatings > 0 ? (sumRatings / totalRatings) : 0;
  
      // Sauvegarde du livre avec la nouvelle note
      await book.save();
  
      res.status(201).json(book);
      
    } catch (error) {
      res.status(500).json({ message: 'Erreur serveur', error });
    }
  };

exports.getBestRatedBooks = (req, res, next) => {
    Book.find()
        .sort({ averageRating: -1 })
        .limit(3)
        .then(books => {
            res.status(200).json(books)
        })
        .catch(error => {
            res.status(400).json({ error });
        });
};

exports.modifyBook = async (req, res, next) => {
    try {
        // Construire l'objet bookObject en fonction de la présence d'un fichier
        const bookObject = req.file ? {
            ...JSON.parse(req.body.book),
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        } : { ...req.body };

        delete bookObject._userId;

        const book = await Book.findOne({ _id: req.params.id });

        if (!book) {
            return res.status(404).json({ message: 'Livre non trouvé' });
        }

        if (book.userId != req.auth.userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Suppression de l'ancienne image si une nouvelle image est uploadée 
        if (req.file && book.imageUrl) {
            const filename = book.imageUrl.split('/images/')[1];
            if (filename) {
                fs.unlinkSync(`images/${filename}`);
            }
            const webpFileName = `${req.file.filename.split('.')[0]}.webp`;
            const webpFilePath = `images/${webpFileName}`;

            // Appel de imageHandler pour gérer la conversion
            await imageHandler(req.file.path, webpFilePath);

            // Mise à jour de l'URL de l'image dans bookObject
            bookObject.imageUrl = `${req.protocol}://${req.get('host')}/${webpFilePath}`;
        }

        await Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id });
        res.status(200).json({ message: 'Livre modifié!' });
    } catch (error) {
        console.error('Erreur dans modifyBook:', error);
        res.status(500).json({ error });
    }
};


 exports.deleteBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id})
        .then(book => {
            if (book.userId != req.auth.userId) {
                return res.status(403).json({message: '403: unauthorized request'});
            }
            const filename = book.imageUrl.split('/images/')[1];
            if (!filename) {
                return res.status(400).json({ message: "Image introuvable" });
            }
            fs.unlink(`images/${filename}`, () => {
                Book.deleteOne({_id: req.params.id})
                    .then(() => { res.status(200).json({message: 'Livre supprimé !'})})
                    .catch(error => res.status(401).json({ error }));
            });
        })
        .catch( error => {
            res.status(500).json({ error });
        });
 };

 exports.getAllBooks = (req, res, next) => {
    Book.find()
        .then(books => res.status(200).json(books))
        .catch(error => res.status(404).json({ error }));
    
};

