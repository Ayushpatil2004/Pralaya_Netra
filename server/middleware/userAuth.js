import jwt from 'jsonwebtoken';

const userAuth = async (req,res,next)=> {
   const token = req.cookies.token || req.headers.token || (req.headers.authorization ? req.headers.authorization.split(' ')[1] : null);

   if(!token) {
    return res.json({success: false, message: 'Not Authorized. Login Again'});
   }

   try{
    const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);

    if(tokenDecode.id){
        req.user = {userId: tokenDecode.id};
    }else{
        return res.json({success: false, message: 'Not Authorized. Login Again'});
    }

    next();

   }catch(error) {
    return res.json({success: false, message: error.message});
   }
}

export default userAuth;