const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middlewares/errorMiddleware');

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(express.json({ limit: '10mb' })); // Increase limit for base64 images if needed
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cors());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.get('/api', (req, res) => {
  res.json({ message: 'API is running' });
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/offers', require('./routes/offerRoutes'));
app.use('/api/email', require('./routes/emailRoutes'));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('Server running in ' + process.env.NODE_ENV + ' mode on port ' + PORT);
});
