const express = require('express');
const cors = require('cors');
const authRoutes = require('./src/routes/auth'); // Updated path
const eventRoutes = require('./src/routes/events'); // Updated path
const { authenticateToken } = require('./src/middleware/auth'); // Updated path

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/events', authenticateToken, eventRoutes);

// Only start the server if this file is run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app; // For testing