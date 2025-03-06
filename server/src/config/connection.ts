import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || '';

const db = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    mongoose.connection.once('open', () => console.log('Database connection established.'));
    return mongoose.connection;
  } catch (error) {
    console.error('Database connection error:', error);
    throw new Error('Database connection failed.');
  }
};

export default db;
