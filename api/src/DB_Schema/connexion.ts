import mongoose from 'mongoose';
import { config } from '../Utils/config';


let isConnected = false;

export async function connectDB() {
  if (!isConnected) {
    try {
      await mongoose.connect(config.mongoUrl);
      console.log('Connexion à MongoDB réussie');
      isConnected = true;
    } catch (err) {
      console.error('Erreur de connexion à MongoDB :', err);
      throw err;
    }
  }
}

export const ObjectID = mongoose.Types.ObjectId
export type ObjectID = InstanceType<typeof ObjectID>

export async function closeDB(){
    await mongoose.disconnect()
}

// Exporter la connexion mongoose
export const db = mongoose;
