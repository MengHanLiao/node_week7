const jwt = require('jsonwebtoken');
const userModel = require('../models/users');
const appError = require('../services/appError');
const handleAsyncError = require('../services/handleAsyncError');

const isAuth = handleAsyncError(async (req, res, next) => {
  let token;
  if(req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if(!token) {
    return next(new appError('尚未登入'));
  }
  const decoded = await new Promise((resolve,reject)=>{
    jwt.verify(token,process.env.JWT_SECRET,(err,payload)=>{
      if(err){
        reject(err);
      }else{
        resolve(payload);
      }
    })
  });
  const currentUser = await userModel.findById(decoded._id);
  if(!currentUser) {
    return next(new appError('使用者 id 不存在'));
  }
  req.userId = currentUser.id;
  next();
});

const generateJWT = (userId) => {
  const token = jwt.sign({_id: userId}, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_DAY
  });
  return token;
}

module.exports = {
  isAuth,
  generateJWT
}