require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();


const allowedOrigins = [
  "http://localhost:5173",
  "https://finance-iq-mu.vercel.app" // 🔁 replace if your URL is different
];


app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like Postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

app.use(express.json());

app.get('/', (req, res) => {
  res.send('FinanceIQ Backend is Live 🚀');
});


app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'FinanceIQ API running 🚀',
  });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/budgets', require('./routes/budgets'));
app.use('/api/investments', require('./routes/investments'));
app.use('/api/dashboard', require('./routes/dashboard'));

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});


app.use((err, req, res, next) => {
  console.error('❌ ERROR:', err.stack);

  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
  });
});


const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});
