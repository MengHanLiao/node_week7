const postsModel = require('../models/posts');
const handleSuccess = require('../services/handleSuccess');
const appError = require('../services/appError');
const handleAsyncError = require('../services/handleAsyncError');
const postModel = require('../models/posts');

const postControllers = {
  getAllPosts: handleAsyncError(async (req, res, next) => {
    const keyword = req.query.q ? {content: new RegExp(req.query.q)} : {};
    const timeSort = req.query.sort === 'asc' ? "createdAt" : "-createdAt";
    const allPosts = await postsModel.find(keyword).populate({
      path: 'user',
      select: '_id nickname photo'
    }).sort(timeSort);
    handleSuccess(res, allPosts);
  }),
  createPost: handleAsyncError(async (req, res, next) => {
    const { content, photo } = req.body;
    if (!content?.trim()) {
      return next(new appError('貼文內容為必填'));
    }
    const newPost = await postModel.create({ content, photo, user: req.userId });
    handleSuccess(res, newPost);
  }),
  isPostCreater: handleAsyncError(async (req, res, next) => {
    const post = await postModel.findById(req.params.postId).select('user');
    if (!post) {
      return next(new appError('沒有此貼文 id'));
    }
    const postCreater = post.user.toString();
    if(postCreater !== req.userId) {
      return next(new appError('非貼文持有人不可更改、刪除貼文'));
    }
    next();
  }),
  editPost: handleAsyncError(async (req, res, next) => {
    const { content, photo } = req.body;
    if (!content?.trim() && !photo?.trim()) {
      return next(new appError('請確認更新內容，貼文內容、貼文圖片擇一修改'));
    }
    const keys = ['photo', 'content'];
    const updateEntries = Object.entries(req.body).filter(item => keys.includes(item[0]) && item[1]);
    const updateData = Object.fromEntries(updateEntries);
    const updateResult = await postModel.findByIdAndUpdate(req.params.postId, updateData, {
      runValidators: true,
      new: true,
      select: 'content photo'
    });
    handleSuccess(res, updateResult);
  }),
  deletePost: handleAsyncError(async (req, res, next) => {
    await postsModel.findByIdAndDelete(req.params.postId);
    const posts = await postsModel.find().select('-user -updatedAt');
    handleSuccess(res, posts);
  }),
  likePost: handleAsyncError(async (req, res, next) => {
    const result = await postModel.findByIdAndUpdate(
      req.params.postId,
      { $addToSet: { likes: req.userId }},
      { new: true }
    );
    if (!result) {
      return next(new appError('請檢查貼文 id 是否存在'));
    }
    handleSuccess(res, result);
  }),
  unlikePost: handleAsyncError(async (req, res, next) => {
    const result = await postModel.findByIdAndUpdate(
      req.params.postId,
      { $pull: { likes: req.userId }},
      { new: true }
    );
    if (!result) {
      return next(new appError('請檢查貼文 id 是否存在'));
    }
    handleSuccess(res, result);
  })
};

module.exports = postControllers;