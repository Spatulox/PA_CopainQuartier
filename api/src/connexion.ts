import mongoose from 'mongoose';

const mongoURI = 'mongodb://admin:admin@localhost:27017/';

mongoose.connect(mongoURI)
    .then(() => console.log(' Connexion à MongoDB réussie'))
    .catch(err => console.error(' Erreur de connexion à MongoDB :', err));

export { mongoose };
