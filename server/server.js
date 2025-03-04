const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config();

const fs = require('fs');
const path = require('path');

// Debug file system
console.log('Current directory:', process.cwd());

// List files in current directory
console.log('Files in current directory:', fs.readdirSync('.'));

// Check if models directory exists
const modelsPath = path.join(__dirname, 'models');
console.log('Models path:', modelsPath);
console.log('Models directory exists:', fs.existsSync(modelsPath));

if (fs.existsSync(modelsPath)) {
  console.log('Files in models directory:', fs.readdirSync(modelsPath));
}

// Debug directory structure
console.log('Current directory:', process.cwd());
console.log('Directory contents:', fs.readdirSync('.'));

// Initialize Express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const mongoURI = process.env.MONGO_URI;
console.log('Attempting to connect to MongoDB with URI available:', !!mongoURI);

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Print directory structure to debug route imports
try {
  console.log('Routes directory contents:', fs.readdirSync('./routes'));
  console.log('Models directory contents:', fs.readdirSync('./models'));
} catch (err) {
  console.error('Error reading directories:', err);
}

// API Routes
app.use('/api/users', require('./routes/users'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/vehicles', require('./routes/vehicles'));
app.use('/api/labor', require('./routes/labor'));
app.use('/api/stats', require('./routes/stats'));

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Attempt to find client build directory
  let clientBuildPath = path.join(__dirname, 'client', 'build');
  
  // Check if this path exists
  if (!fs.existsSync(clientBuildPath)) {
    // Try alternative path
    clientBuildPath = path.join(__dirname, '..', 'client', 'build');
    console.log('Trying alternate client build path:', clientBuildPath);
  }
  
  console.log('Client build path:', clientBuildPath);
  console.log('Path exists:', fs.existsSync(clientBuildPath));
  
  if (fs.existsSync(clientBuildPath)) {
    app.use(express.static(clientBuildPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(clientBuildPath, 'index.html'));
    });
  } else {
    console.error('Client build directory not found');
  }
}

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));