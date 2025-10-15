import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import cookieParser from 'cookie-parser';

import { fileURLToPath } from 'url'; 
import path from 'path';

import connectDB from './config/mongodb.js';
import authRouter from './routes/authRoutes.js';   
import userRouter from './routes/userRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;
connectDB();

const allowedOrigins = ['http://localhost:5173'];

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({origin: allowedOrigins, credentials: true}));

// API Endpoints
app.get('/', (req, res) => res.send('Server is running'));  
  
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);

if (process.env.NODE_ENV === 'production') {
    // Path to the built React files (using '..' to go from /server up to root, then down to /client/dist)
    const clientBuildPath = path.join(__dirname, '..', 'client', 'dist');

    // 1. Serve static files (CSS, JS, images)
    app.use(express.static(clientBuildPath));

    // 2. Catch-all route: For all other requests, send the main index.html file
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(clientBuildPath, 'index.html'));
    });
} else {
    // Development response for the root path
    app.get('/', (req, res) => res.send('Server is running in Development'));
}

app.listen(PORT, () => {
  console.log(`Server is running on PORT : ${PORT}`);
});