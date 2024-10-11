// middlewares/sharp-config.js
const sharp = require('sharp');
const fs = require('fs');

const imageHandler = async (inputPath, outputPath) => {
    try {
        await sharp(inputPath)
            .resize({ width: 463, height: 595, fit: 'cover', position: 'center' })
            .toFormat('webp', { quality: 90 })
            .toFile(outputPath);
        
        // Suppression du fichier d'origine après conversion
        fs.unlink(inputPath, (err) => {
            if (err) {
                console.error('Erreur lors de la suppression de l\'ancien fichier:', err);
            } else {
                console.log('Fichier supprimé');
            }
        });
    } catch (error) {
        console.error('Erreur lors du traitement de l\'image:', error);
        throw error; // Propager l'erreur
    }
};

module.exports = { imageHandler };
