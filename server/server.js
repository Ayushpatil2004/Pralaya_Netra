import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import cookieParser from 'cookie-parser';

import connectDB from './config/mongodb.js';
import authRouter from './routes/authRoutes.js';   
import userRouter from './routes/userRoutes.js';
import adminRouter from './routes/adminRoutes.js';
import userModel from './models/userModel.js';

const app = express();
const PORT = process.env.PORT || 4000;
connectDB().then(async () => {
    try {
        await userModel.findOneAndUpdate(
            { email: 'ayushpatil1364@gmail.com' },
            { $set: { role: 'admin', isAdminApproved: true } }
        );
        console.log("Admin account privileges dynamically ensured for ayushpatil1364@gmail.com");
    } catch(err) {
        console.error("Admin seed check failed:", err.message);
    }
});

const allowedOrigins = ['http://localhost:5173', process.env.CLIENT_URL];

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors(
  {
  origin: allowedOrigins,
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'token']
}
));

// API Endpoints
app.get('/', (req, res) => res.send('Server is running'));  
app.get('/api/ping', (req, res) => res.status(200).json({ success: true, message: 'Pong!' }));
  
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/admin', adminRouter);

app.listen(PORT, () => {
  console.log(`Server is running on PORT : ${PORT}`);
});
