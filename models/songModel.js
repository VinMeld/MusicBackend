const mongoose = require('mongoose');

const songSchema = mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Song title is required'],
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',  
      },
    description: {
        type: String,
        required: [true, 'Song description is required'],
    },
    likes: {
        type: Number,
        default: 0,
    },
    likedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    isPrivate: {
        type: Boolean,
        default: true,
    },
    comments: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        text: {
            type: String,
            default: '',
        },
        date: {
            type: Date,
            default: Date.now,
        },
    }],
    link: {
        type: String,
        required: [true, 'Song link is required'],
    },
    tags: [{
        type: String,
        default: '',
    }],
},{
    timestamps: true,
})

module.exports = mongoose.model('Song', songSchema);