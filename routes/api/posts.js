const express = require("express");
const router = express.Router();
const {
    check,
    validationResult
} = require('express-validator/check');
const auth = require('../../middleware/auth');
const Post = require('../../models/Posts');
const Profile = require('../../models/Profile');
const User = require('../../models/User');


/** @route POST api/posts
 *  @desc create a post
 *  @access private
 */
router.post("/", [auth,
        [
            check('text', 'text is required').not().isEmpty()
        ]
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
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

        } catch (error) {
            console.error(error.message);
            res.status(500).send('server error');

        }

    });

/** @route GET api/posts
 *  @desc Get all post
 *  @access private
 */

router.get('/', auth, async (req, res) => {
    try {
        const posts = await Post.find().sort({
            date: -1 // sort by most recent
        });

        res.json(posts);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('server error');
    }
});

/** @route GET api/posts
 *  @desc Get post by id
 *  @access private
 */

router.get('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                msg: 'post not found'
            });
        }

        res.json(post);


    } catch (error) {
        console.error(error.message);
        if (error.kind === 'ObjectId') {
            return res.status(404).json({
                msg: 'post not found'
            });
        }
        res.status(500).send('server error');
    }
});

/** @route DELETE api/posts/:id
 *  @desc delete a post
 *  @access private
 */

router.delete('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        //check if post exists
        if (!post) {
            return res.status(404).json({
                msg: 'post not found'
            });
        }

        //check if user is autorized 
        if (post.user.toString() !== req.user.id) {
            return res.status(401).json({
                msg: 'user not authorized'
            });
        } else {
            await post.remove();
        }


        res.json({
            msg: 'post removed'
        });

    } catch (error) {
        console.error(error.message);
        if (error.kind === 'ObjectId') {
            return res.status(404).json({
                msg: 'post not found'
            });
        }
        res.status(500).send('server error');
    }
});

/** @route PUT api/posts/like/:id
 *  @desc like a post
 *  @access private
 */

router.put('/like/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        //check if post has already been liked by user.
        if (post.likes.filter(like => like.user.toString() === req.user.id).length() > 0) {
            return res.status(400).json({
                msg: 'post already liked'
            })
        }

        post.likes.unshift({
            user: req.user.id
        });

        await post.save(); //save to db

    } catch (error) {
        console.error(error.message);
        res.status(500).send('server error');
    }
})

/** @route PUT api/posts/unlike/:id
 *  @desc like a post
 *  @access private
 */

router.put('/like/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        //check if post has already been liked by user.
        if (post.likes.filter(like => like.user.toString() === req.user.id).length() === 0) {
            return res.status(400).json({
                msg: 'post has not yet been liked'
            })
        }

        // get remove index. 
        const removeIndex = post.likes.map(like => like.user.toString()).indexOf(req.user.id);
        post.likes.splice(removeIndex, 1);

        await post.save(); //save to db

    } catch (error) {
        console.error(error.message);
        res.status(500).send('server error');
    }
})



module.exports = router;