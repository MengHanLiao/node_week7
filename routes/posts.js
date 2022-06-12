const express = require('express');
const router = express.Router();
const postControllers = require('../controllers/posts');
const { isAuth } = require('../middlewares/auth');

router.use(isAuth);
router.get('/posts', postControllers.getAllPosts);
router.post('/post', postControllers.createPost);
router.patch('/post/:postId', postControllers.isPostCreater, postControllers.editPost);
router.delete('/post/:postId', postControllers.isPostCreater, postControllers.deletePost);
router.post('/post/:postId/like', postControllers.likePost);
router.delete('/post/:postId/like',  postControllers.unlikePost);

module.exports = router;