const mongoose = require('mongoose');
const Tour = require('./toursSchema');

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

// Preventing duplicate reviews
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

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

reviewSchema.statics.calcAverageRatings = async function (tourId) {
    const stats = await this.aggregate([
        {
            $match: { tour: tourId }
        },
        {
            $group: {
                _id: '$tour',
                numberOfRating: { $sum: 1 },
                avgRating: { $avg: '$rating' }
            }
        }
    ])

    if (stats.length > 0) {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: stats[0].numberOfRating,
            ratingsAverage: stats[0].avgRating
        });
    } else {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: 0,
            ratingsAverage: 4.5
        });
    }
}

reviewSchema.post('save', function (next) {
    this.constructor.calcAverageRatings(this.tour);
    next();
})

// pre hook for update and for delete
reviewSchema.pre(/^findOneAnd/, async function (next) {
    // this.rev so that we can have access to it in the next hook
    // so saving the doc in this variable and then later retrieving it in the post hook
    this.rev = await this.findOne();
    next();
})

reviewSchema.post(/^findOneAnd/, async function (next) {
    await this.rev.constructor.calcAverageRatings(this.rev.tour);
})

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;