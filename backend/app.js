const express = require('express');
const mongoose = require('mongoose');

const booksRoutes = require('./routes/books');
const userRoutes = require ('./routes/user');

const path = require ('path');

const app = express();

mongoose.connect('mongodb+srv://kim9truong:owJLBqdrpDYQ5IGD@cluster0.apejr.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0') 
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch((err) => console.log('Connexion à MongoDB échouée !', err));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
  });

app.use(express.json());

app.use('/api/books', booksRoutes);
app.use('/api/auth', userRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));

module.exports = app;

