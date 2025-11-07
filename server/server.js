import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import cookieParser from 'cookie-parser';

import connectDB from './config/mongodb.js';
import authRouter from './routes/authRoutes.js';   
import userRouter from './routes/userRoutes.js';

import path from 'path';


const app = express();
const PORT = process.env.PORT || 4000;
connectDB();

const allowedOrigins = ['http://localhost:5173'];

const _dirname = path.resolve();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors(
  {
  origin: allowedOrigins,
  credentials: true
}
));

// API Endpoints
// app.get('/', (req, res) => res.send('Server is running'));  
  
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);

app.use(express.static(path.join(_dirname, "/client/dist")));

app.get(/.*/, (req, res) => {
  res.sendFile(path.resolve(_dirname, "client", "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server is running on PORT : ${PORT}`);
});