const express = require('express');
const router = express.Router();
const appError = require("../services/appError");
const handleAsyncError = require("../services/handleAsyncError");
const sizeOf = require('image-size');
const upload = require('../middlewares/image');
const { ImgurClient } = require('imgur');
const { isAuth } = require('../middlewares/auth');
const handleSuccess = require('../services/handleSuccess');

router.post('/', isAuth, upload, handleAsyncError(async (req, res, next)=> {
  if(!req.files?.length) {
    return next(new appError('尚未上傳檔案'));
  }
  // 控制圖片比例
  // const dimensions = sizeOf(req.files[0].buffer);
  // if(dimensions.width !== dimensions.height) {
  //   return next(new appError('圖片長寬不符合 1:1 尺寸'));
  // }
  const client = new ImgurClient({
    clientId: process.env.IMGUR_CLIENT_ID,
    clientSecret: process.env.IMGUR_CLIENT_SECRET,
    refreshToken: process.env.IMGUR_REFRESH_TOKEN,
  });
  const response = await client.upload({
    image: req.files[0].buffer.toString('base64'),
    type: 'base64',
    album: process.env.IMGUR_ALBUM_ID
  });
  handleSuccess(res, response.data.link);
}));

module.exports = router;