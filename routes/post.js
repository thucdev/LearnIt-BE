const express = require('express')
const router = express.Router()

const Post = require('../models/Post')
const verifyToken = require('../middleware/auth')

//@route GET api/post
//@desc get post
// @access Private
router.get('/', verifyToken, async (req, res) => {
    try {
        const posts = await Post.find({ user: req.userId }).populate('user', ['username'])
        res.status(200).json({ success: true, posts })
    } catch (error) {
        console.log('e', error)
        res.status(500).json({ success: false, message: 'Internal error server' })
    }
})

//@route POST api/post
//@desc create post
// @access Private

router.post('/', verifyToken, async (req, res) => {
    const { title, description, status, url } = req.body

    if (!title) return res.status(400).json({ success: false, message: 'Tittle is required' })

    try {
        const newPost = new Post({
            title,
            description,
            url: url.startsWith('https://') ? url : `https://${url}`,
            status: status || 'TO LEARN',
            user: req.userId,
        })

        await newPost.save()
        res.json({ success: true, message: 'Happy learning', post: newPost })
    } catch (error) {
        console.log('e', error)
        res.status(500).json({ success: false, message: 'Internal error server' })
    }
})

//@route PUT api/post
//@desc edit post
// @access Private

router.put('/:id', verifyToken, async (req, res) => {
    const { title, description, status, url } = req.body

    if (!title) return res.status(400).json({ success: false, message: 'Tittle is required' })

    try {
        let updatedPost = {
            title,
            description: description || '',
            url: (url.startsWith('https://') ? url : `https://${url}`) || '',
            status: status || 'TO LEARN',
        }
        const postUpdateCondition = { _id: req.params.id, user: req.userId }
        updatedPost = await Post.findOneAndUpdate(postUpdateCondition, updatedPost, { new: true })

        //User not authorized to update post
        if (!updatedPost)
            return res
                .status(401)
                .json({ success: false, message: 'Post not found or user not authorized' })

        res.json({ success: true, message: 'Excellent progress', post: updatedPost })
    } catch (error) {
        console.log('e', error)
        res.status(500).json({ success: false, message: 'Internal error server' })
    }
})

//@route DELETE api/post
//@desc delete post
// @access Private
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const postDeleteCondition = { _id: req.params.id, user: req.userId }
        const deletedPost = await Post.findOneAndDelete(postDeleteCondition)

        if (!deletedPost)
            return res
                .status(401)
                .json({ success: false, message: 'Post not found or user not authorized' })

        res.json({ success: true, post: deletedPost })
    } catch (error) {
        console.log('e', error)
        res.status(500).json({ success: false, message: 'Internal error server' })
    }
})

module.exports = router
