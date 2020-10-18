const { Router } = require('express');
const express = require('express');
const router = express.Router();
const {check, validationResult} = require("express-validator");
const config = require('config');
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const Profile = require('../../models/Profile');
const Post = require('../../models/Post');
const { remove } = require('../../models/User');


// @route   POST api/posts
// @desc    Create post
// @access  Private
router.post('/', [
    auth,
    [
        check('text', 'O conteúdo do post deve conter, no mínimo, 30 caracteres.')
            .isLength({ min: 30})
    ]
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select('-password');

      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
      });

      const post = await newPost.save();

      res.json(post);
    } catch (err) {
        console.log(err.message);
        res.status('500').send(config.get("serverError"));
    }
});


// @route   GET api/posts
// @desc    Get all posts
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const posts = await Post.find().sort({ date: -1 });

        res.json({ posts });
    } catch (err) {
        console.log(err.message);
        res.status('500').send(config.get("errorServer"));
    }
});


// @route   GET api/posts/post/:id
// @desc    Get post by ID
// @access  Private
router.get('/post/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if(!post){
            return res.status('404').send({ msg: "Post não encontrado." });
        }

        res.json({ post });
    } catch (err) {
        console.log(err.message);

        if(err.kind === 'ObjectId'){
            return res.status('404').send({ msg: "Post não encontrado." });
        }

        res.status('500').send(config.get("serverError"));
    }
});

// @route   GET api/posts/me
// @desc    Get posts by logged in user
// @access  Private
router.get('/me/', auth, async (req, res) => {
    try {

        const posts = await Post.find({ user: req.user.id });

        res.json({ posts });
    } catch (err) {
        console.log(err.message);
        res.status('500').send(config.get("serverError"));
    }
});

// @route   DELETE api/posts/:id
// @desc    Delete post by ID
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {

        const post = await Post.findById(req.params.id);

        if(!post){
            return res.status('404').send({ msg: "Post não encontrado." });
        }

        // Check user
        if(post.user.toString() !== req.user.id){
            return res.status('401').send({ msg: config.get("unauthorizedError") });
        }

        await post.remove();

        res.json({ msg: "Post excluído." });

    } catch (err) {
        console.log(err.message);

        if(err.kind === 'ObjectId'){
            return res.status('404').send({ msg: "Post não encontrado." });
        }

        res.status('500').send(config.get("serverError"));
    }
});


// @route   PUT api/posts/like/:id
// @desc    Like a post
// @access  Private
router.put('/like/:id', auth, async (req, res) =>{
    try {
        const post = await Post.findById(req.params.id);

        if(!post){
            return res.status('404').send({ msg: "Post não encontrado." });
        }

        // Check if the post has alreaby been liked by the user
        if(post.likes.filter(like => like.user.toString() == req.user.id).length > 0){
            return res.status('400').send({ msg: "Você já curtiu este post." });
        }

        post.likes.unshift({ user:req.user.id });

        await post.save();

        res.json(post.likes);

    } catch (err) {
        console.log(err.message);

        if(err.kind === 'ObjectId'){
            return res.status('404').send({ msg: "Post não encontrado." });
        }

        res.status('500').send(config.get("serverError"))
    }
});


// @route   PUT api/posts/unlike/:id
// @desc    Like a post
// @access  Private
router.put('/unlike/:id', auth, async (req, res) =>{
    try {
        const post = await Post.findById(req.params.id);

        if(!post){
            return res.status('404').send({ msg: "Post não encontrado." });
        }

        // Check if the post has alreaby been liked by the user
        if(post.likes.filter(like => like.user.toString() == req.user.id).length === 0){
            return res.status('400').send({ msg: "Você ainda não curtiu este post." });
        }

        // Get remove index
        const removeIndex = post.likes.map(like => like.user.toString()).indexOf(req.user.id);

        post.likes.splice(removeIndex, 1);

        await post.save();

        res.json(post.likes);

    } catch (err) {
        console.log(err.message);

        if(err.kind === 'ObjectId'){
            return res.status('404').send({ msg: "Post não encontrado." });
        }

        res.status('500').send(config.get("serverError"))
    }
});

// @route   POST api/posts/comment/:id
// @desc    Create post comment
// @access  Private
router.post('/comment/:id', [
    auth,
    [
        check('text', 'O comentário não pode ser vazio.')
            .not()
            .isEmpty()
    ]
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select('-password');

    if(!user){
        return res.status('404').json({ msg: "Perfil não encontrado." });
    }

    const post = await Post.findById(req.params.id);

    if(!post){
        return res.status('404').json({ msg: "Post não encontrado." });
    }

      const newComment = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
      };

      post.comments.unshift(newComment);

      await post.save();

      res.json(post.comments);
    } catch (err) {
        console.log(err.message);

        if(err.kind === 'ObjectId'){
            return res.status('404').json({ msg: "Post não encontrado." });
        }

        res.status('500').send(config.get("serverError"));
    }
});

// @route   DELETE api/posts/comment/:id/:comment_id
// @desc    Create post comment
// @access  Private
router.delete('/comment/:id/:comment_id', auth, async(req, res) =>{
 
    try{
        const post = await Post.findById(req.params.id);
        
        // Pull out comment
        const comment = post.comments.find(comment => comment.id === req.params.comment_id);

        // Make sure comment exists
        if(!comment){
            return res.status('404').json({ msg: "Comentário não encontrado." });
        }

        // Check user
        if(comment.user.toString() !== req.user.id){
            return res.status('401').json({ msg: config.get("unauthorizedError") });
        }

        const removeIndex = post.comments.map(comment => comment.user.toString()).indexOf(req.user.id);

        post.comments.splice(removeIndex, 1);

        await (await post).save();

        res.json(post.comments);
    } catch (err) {
            console.log(err.message);

            if(err.kind === 'ObjectId'){
                return res.status('404').json({ msg: "Post não encontrado." });
            }

            res.status('500').send(config.get("serverError"));
        }
    });

module.exports = router;