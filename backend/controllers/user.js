const bcrypt  = require ('bcrypt');
const jwt = require ('jsonwebtoken');

const User = require('../models/User');

// Création de compte
exports.signup = (req, res, next) => {
  //Hashage du mot de passe
    bcrypt.hash(req.body.password, 10)
      .then(hash => {
        // Création nouvel utilisateur avec email et mdp haschés
        const user = new User({
            email: req.body.email,
            password: hash
        });
        //Sauvegarde de l'utilisateur
        user.save()
          .then(() => res.status(201).json({message: 'Utilisateur créé'}))
          .catch(error => res.status(400).json ({error}));
      })
      .catch(error => res.status(500).json({error}));

};

//Connexion de l'utilisateur
exports.login = (req, res, next) => {
    User.findOne({email: req.body.email})
      .then(user => {
        if (!user) {
            return res.status(401).json({message: 'Paire login/mdp incorrecte'})
        }
        // Comparaison mots de passe
        bcrypt.compare(req.body.password, user.password)
          .then(valid => {
            if (!valid) {
                return res.status(401).json({message : 'Paire login/mdp incorrecte'});
            }
            res.status(200).json({
                userId : user._id,
                token: jwt.sign({userId: user._id}, process.env.TOKEN_SECRET, {expiresIn: '48h'})
            });
          })
          .catch(error => res.status(500).json({error}))

      })
      .catch(error => res.status(500).json({error}))
};