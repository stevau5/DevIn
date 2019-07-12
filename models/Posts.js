const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const PostSchema = new Schema({
    // this makes a user connected to a post via their id
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    text: {
        type: String,
        required: true
    },
    name: {
        type: String
    },
    avatar: {
        type: string
    },
    likes: [
        {
            // array of people who like the post
            user: {
                type: Schema.Types.ObjectId,
                ref: 'users'
            }
        }
    ],
    comments: [
        {
            // array of people who comment on the post
            user: {
                type: Schema.Types.ObjectId,
                ref: 'users'
            },
            text: {
                type: String,
                required: true
            },
            name: {
                type: String
            },
            avatar: {
                type: String
            },
            // date of comment. 
            date: { 
                type: Date,
                default: Date.now

            }
        }
    ],
    // date of post
    date: {
        type: Date,
        default: Date.now
    }
});


module.exports = Post = mongoose.model('post', PostSchema);