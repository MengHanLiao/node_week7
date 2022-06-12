const bcrypt = require('bcryptjs');
const validator = require('validator');
const userModel = require('../models/users');
const { generateJWT } = require('../middlewares/auth');
const handleSuccess = require('../services/handleSuccess');
const appError = require('../services/appError');
const handleAsyncError = require('../services/handleAsyncError');

const userController = {
  signUp: handleAsyncError(async (req, res, next) => {
    const { email, comfirmPassword, nickname } = req.body;
    let password = req.body.password;
    if (!email || !password || !comfirmPassword || !nickname) {
      return next(new appError('必填欄位未填寫'));
    }
    if (!validator.isEmail(email)) {
      return next(new appError('email 格式不正確'));
    }
    const isExistEmail = await userModel.findOne({ email });
    if (isExistEmail) {
      return next(new appError('信箱已被註冊'));
    }
    if (!validator.isStrongPassword(password, { minSymbols: 0 })) {
      return next(new appError('密碼需至少 8 碼，英數混和，包含大小寫'));
    }
    if (password !== comfirmPassword) {
      return next(new appError('密碼確認不一致'));
    }
    if (nickname.trim().length < 2) {
      return next(new appError('暱稱需要 2 個字元以上'));
    }
    password = await bcrypt.hash(req.body.password, 12);
    const newUser = await userModel.create({ email, password, nickname });
    const token = generateJWT(newUser._id);
    const data = { token, nickname };
    handleSuccess(res, data);
  }),
  signIn: handleAsyncError(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new appError('帳號或密碼未填寫'))
    }
    const user = await userModel.findOne({ email }).select('id nickname password');
    if (!user) {
      return next(new appError('Email 尚未註冊'));
    }
    const auth = await bcrypt.compare(password, user.password);
    if (!auth) {
      return next(new appError('密碼不正確'));
    }
    const token = generateJWT(user.id);
    const data = {
      token,
      nickname: user.nickname
    }
    handleSuccess(res, data);
  }),
  updatePassword: handleAsyncError(async (req, res, next) => {
    const { password, comfirmPassword } = req.body;
    if (!password || !comfirmPassword) {
      return next(new appError('密碼與確認密碼欄位皆為必填'));
    }
    if (!validator.isStrongPassword(password, { minSymbols: 0 })) {
      return next(new appError('密碼需至少 8 碼，英數混和，包含大小寫'));
    }
    if (password !== comfirmPassword) {
      return next(new appError('密碼確認不一致'));
    }
    const newPassword = await bcrypt.hash(password, 12);
    await userModel.findByIdAndUpdate(req.userId, {password: newPassword});
    handleSuccess(res, "新密碼設置成功");
  }),
  getProfile: handleAsyncError(async (req, res, next) => {
    const profile = await userModel.findById(req.userId);
    const data = {
      id: profile._id,
      photo: profile.photo,
      nickname: profile.nickname,
      gender: profile.gender,
    };
    handleSuccess(res, data);
  }),
  editProfile: handleAsyncError(async (req, res, next) => {
    const { photo, nickname, gender } = req.body;
    if (!photo?.trim() && !nickname && !gender) {
      return next(new appError('請確認更新內容！頭貼、暱稱、性別擇一變更'));
    }
    if (nickname.trim().length < 2) {
      return next(new appError('暱稱需要 2 個字元以上'));
    }
    if (!validator.isIn(gender, ['男性', '女性', '其他'])) {
      return next(new appError('男性、女性、其他 三擇一'));
    }
    const keys = ['photo', 'nickname', 'gender'];
    const updateEntries = Object.entries(req.body).filter(item => keys.includes(item[0]) && item[1]);
    const updateData = Object.fromEntries(updateEntries);
    const updatedProfile = await userModel.findByIdAndUpdate(
      req.userId,
      updateData,
      { new: true }
    ).select('_id photo nickname gender');
    handleSuccess(res, updatedProfile);
  })
}

module.exports = userController;