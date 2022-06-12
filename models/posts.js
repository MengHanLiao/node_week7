const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    content: {
      type: String, 
      trim: true,
      required: [true, '貼文內容為必填']
    },
    photo: {
      type: String,
      trim: true,
      default: ''
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      require: ['true', '貼文 id 為必填']
    },
    likes: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      }
    ]
  },
  {
    versionKey: false,
    timestamps: true,
  }
)

const postModel = mongoose.model('Post', postSchema);
module.exports = postModel;