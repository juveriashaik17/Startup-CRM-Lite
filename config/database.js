import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from backend/.env and root .env
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

/**
 * Connect to MongoDB Atlas Database.
 * 
 * Configures Mongoose connection options, logs successful connection
 * with host info, and terminates the process with failure code if connection fails.
 * In development, detects placeholder URI strings and logs clear setup guidance.
 * 
 * @returns {Promise<void>}
 */
export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  const isPlaceholder =
    !uri ||
    uri.includes('your_mongodb_atlas_connection_string_goes_here') ||
    uri.includes('cluster0.xxxxx') ||
    uri.includes('<username>') ||
    uri.includes('<password>') ||
    uri.includes('cluster0.srtalq1');

  if (isPlaceholder) {
    console.log('\n' + '='.repeat(60));
    console.log('⚡ STARTING IN LOCAL OFFLINE MODE (No cloud database required)');
    console.log('   All registrations, logins, and leads are saved in backend/data/db.json');
    console.log('='.repeat(60) + '\n');
    return null;
  }

  try {
    const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
    console.log(`MongoDB Atlas Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn('\n' + '='.repeat(60));
    console.warn(`⚠️  Could not connect to MongoDB Atlas: ${error.message}`);
    console.warn('⚡ Seamlessly running in LOCAL OFFLINE MODE (Data stored in backend/data/db.json)');
    console.warn('='.repeat(60) + '\n');
    return null;
  }
};

export default connectDB;
