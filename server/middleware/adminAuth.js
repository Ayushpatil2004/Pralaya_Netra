import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';

const adminAuth = async (req,res,next)=> {
   const token = req.cookies.token || req.headers.token || (req.headers.authorization ? req.headers.authorization.split(' ')[1] : null);

   if(!token) {
    return res.json({success: false, message: 'Not Authorized. Login Again'});
   }

   try{
    const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);

    if(tokenDecode.id){
        // Now check if this user is actually an admin in the database
        const user = await userModel.findById(tokenDecode.id);
        if(!user || user.role !== 'admin') {
             return res.json({success: false, message: 'Access Denied: Admins Only'});
        }
        
        req.user = {userId: tokenDecode.id};
    }else{
        return res.json({success: false, message: 'Not Authorized. Login Again'});
    }

    next();

   }catch(error) {
    return res.json({success: false, message: error.message});
   }
}

export default adminAuth;
