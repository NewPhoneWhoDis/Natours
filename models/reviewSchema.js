const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
    {
        review: {
            type: String,
            required: [true, 'Review should not be empty!']
        },
        rating: {
            type: Number,
            min: 1,
            max: 5,
            required: [true, 'Review must have a rating!']
        },
        createdAt: {
            type: Date,
            default: Date.now(),
            select: false
        },
        user: [
            {
                type: mongoose.Schema.ObjectId,
                ref: 'User',
                required: [true, 'Review must have an author!']
            }
        ],
        tour: [
            {
                type: mongoose.Schema.ObjectId,
                ref: 'Tour',
                required: [true, 'Review must belong to a tour!']
            }
        ]
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

const Review = mongoose.model('Review', reviewSchema);

reviewSchema.pre(/^find/, function (next) {
    //* Cannot decide whether I want to populate with user and tour or just user
    /*
    this.populate({
        path: 'user',
        select: 'name photo'
    }).populate({
        path: 'tour',
        select: 'name'
    })
    */

    this.populate({
        path: 'user',
        select: 'name photo'
    })

    next();
})

module.exports = Review;