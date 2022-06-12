const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      trim: true,
      required: [true, 'email 是必填項目']
    },
    password: {
      type: String,
      trim: true,
      required: [true, '密碼是必填項目']
    },
    photo: {
      type: String,
      trim: true,
      default: ''
    },
    nickname: {
      type: String,
      default: 'METAWALKER',
      required: [true, '暱稱是必填項目']
    },
    gender: {
      type: String,
      default: '男性',
      enum: ['男性', '女性', '其他']
    },
    followers: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      }
    ],
    followings: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      }
    ]
  },
  {
    versionKey: false,
    timestamps: true
  }
)

const userModel = mongoose.model('User', userSchema);
module.exports = userModel;
