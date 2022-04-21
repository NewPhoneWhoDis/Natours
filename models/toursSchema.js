const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'A tour must have a name'],
            unique: true,
            trim: true,
            maxlength: [40, 'A tour name must have less or equal then 40 characters'],
            minlength: [10, 'A tour name must have more or equal then 10 characters'],
        },
        slug: String,
        duration: {
            type: Number,
            required: [true, 'A tour must have a duration']
        },
        maxGroupSize: {
            type: Number,
            required: [true, 'A tour must have a group size']
        },
        difficulty: {
            type: String,
            required: [true, 'A tour must have a difficulty'],

            enum: {
                values: ['easy', 'medium', 'difficult'],
                message: 'Difficulty is either: easy, medium, difficult'
            }

        },
        ratingsAverage: {
            type: Number,
            default: 4.5,
            min: [1, 'Rating must be above 1.0'],
            max: [5, 'Rating must be below 5.0'],
            set: val => Math.round(val * 10) / 10  // from 4.6666 => 46.6666 => 47 => 4,7
        },
        ratingsQuantity: {
            type: Number,
            default: 0
        },
        price: {
            type: Number,
            required: [true, 'A tour must have a price']
        },
        priceDiscount: {
            type: Number,

            validate: {
                validator: function (val) {
                    // only points to current doc on NEW document creation
                    return val < this.price;
                },
                message: 'Discount price ({VALUE}) should be below regular price'
            }

        },
        summary: {
            type: String,
            trim: true,
            required: [true, 'A tour must have a description']
        },
        description: {
            type: String,
            trim: true
        },
        imageCover: {
            type: String,
            required: [true, 'A tour must have a cover image']
        },
        images: [String],
        createdAt: {
            type: Date,
            default: Date.now(),
            select: false
        },
        startDates: [Date],
        secretTour: {
            type: Boolean,
            default: false
        },
        startLocation: {
            type: {
                type: String,
                default: 'Point',
                enum: ['Point']
            },
            coordinates: [Number],
            address: String,
            description: String
        },
        locations: [
            {
                type: {
                    type: String,
                    default: 'Point',
                    enum: ['Point']
                },
                coordinates: [Number],
                address: String,
                description: String,
                day: Number
            }
        ],
        guides: [
            {
                type: mongoose.Schema.ObjectId,
                ref: 'User'
            }
        ]
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// 1 sort in ascending / -1 sort in descending order
// setting single field index to query the results faster
tourSchema.index({ price: 1 });
tourSchema.index({ slub: 1 });

//* In order to perform geospatial Queries we need to attribute an index to the field where the geospatial data is stored!
// 2dSphere for data describing real points or for fictional points on a 2 dimentional plane!
tourSchema.index({ startLocation: '2dsphere' })

/*combined query for price ascending and ratingsAverage descending order
tourSchema.index({ price: 1, ratingsAverage: -1})
*/

tourSchema.virtual('durationWeeks').get(function () {
    return this.duration / 7;
});

// Virtual populate the review into tours
tourSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'tour',
    localField: '_id'
})

//* DOCUMENT MIDDLEWARE: runs before .save() and .create(), won't run before insertMany()
tourSchema.pre('save', function (next) {
    this.slug = slugify(this.name, { lower: true });
    next();
});

//* Query middleware
// /^find/ means that this middleware should be executed for all the commands that start with find
tourSchema.pre(/^find/, function (next) {
    this.find({ secretTour: { $ne: true } });

    this.start = Date.now();
    next();
});

// runs after the query has been executed
tourSchema.post(/^find/, function (docs, next) {
    console.log(`Query took ${Date.now() - this.start} milliseconds!`);
    next();
});

tourSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'guides',
        // Basically excluding these 2 properties because they are not needed!
        select: '-__v -passwordChangedAt'
    })
    next();
})

//* Aggregation middleware
// added geoAggregate because in the previous implementation $match was running first and was creating an error for geoNear
tourSchema.pre('aggregate', function (next) {
    const GEOSPATIAL_OPERATOR_TEST = /^[$]geo[a-zA-Z]*/;

    // Checking if the pipeline stage name has any geo operator using the regex.
    // The 'search' method on a string returns -1 if the match is not found else non zero value
    const geoAggregate = this.pipeline()
        .filter(stage => Object.keys(stage)[0].search(GEOSPATIAL_OPERATOR_TEST) !== -1
        );

    // filtering out the secret tours from the aggregation pipeline
    if (geoAggregate.length === 0) {
        this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
    }

    console.log(this.pipeline());
    next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;