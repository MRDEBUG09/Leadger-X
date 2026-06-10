import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://mock-db-uri';

export async function connectDatabase(): Promise<typeof mongoose | null> {
  if (process.env.NODE_ENV === 'test' || MONGODB_URI.includes('mock')) {
    console.log('ℹ️ Running in Sandbox/Test mode. MongoDB connection skipped.');
    return null;
  }

  try {
    const options: mongoose.ConnectOptions = {
      autoIndex: true,
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    };

    mongoose.connection.on('connected', () => {
      console.log('✅ LeadgerX persistent database connected successfully.');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ Mongoose connection failure:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ Mongoose connection severed.');
    });

    return await mongoose.connect(MONGODB_URI, options);
  } catch (error) {
    console.error('💥 Database bootstrap error:', error);
    process.exit(1);
  }
}
