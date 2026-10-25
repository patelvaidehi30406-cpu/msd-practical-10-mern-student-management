const mongoose = require('mongoose');
const dns = require('dns');

// Use Google & Cloudflare public DNS servers to prevent "querySrv ECONNREFUSED"
// errors when resolving mongodb+srv:// URLs on Windows networks
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (err) {
  // Ignore if DNS servers cannot be overridden
}

/**
 * Connect to MongoDB Atlas using the connection URI from environment variables.
 * Automatically retries after 5 seconds if the initial connection fails.
 */
const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI?.trim();

  if (!mongoURI) {
    console.error('Error: MONGODB_URI is not defined in your .env file.');
    return;
  }

  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.log(
      'Retrying MongoDB Atlas connection in 5 seconds... (Using local fallback storage until connected)'
    );
    setTimeout(connectDB, 5000);
  }
};

module.exports = connectDB;
