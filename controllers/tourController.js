const Tour = require('./../models/toursSchema');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');
const AppError = require('./../utils/appError');

// manipulated query string for top 5 most popular tours
exports.mostPopular = async (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
};

exports.getAllTours = factory.getAll(Tour);

exports.getTour = factory.getOne(Tour, { path: 'reviews' });

exports.createTour = factory.createOne(Tour);

exports.updateTour = factory.updateOne(Tour);

exports.deleteTour = factory.deleteOne(Tour);

exports.getToutStatistics = catchAsync(async (req, res, next) => {
    const statistics = await Tour.aggregate([
        {
            $match: { ratingsAverage: { $gte: 4.5 } }
        },
        {
            $group: {
                _id: { $toUpper: '$difficulty' },
                numberTours: { $sum: 1 },
                numberRatings: { $sum: '$ratingsQuantity' },
                avgRating: { $avg: '$ratingsAverage' },
                avgPrice: { $avg: '$price' },
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' }
            }
        },
        {
            // sort ascending
            $sort: { avgPrice: 1 }
        },
    ]);

    res.status(200).json({ status: 'success', data: { statistics } });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
    const year = req.params.year * 1;

    const plan = await Tour.aggregate([
        {
            // deconstruct an array field in a document and create separate output documents for each item in the array
            $unwind: '$startDates'
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`)
                }
            }
        },
        {
            $group: {
                // $month will return month for a date as a number between 1 and 12
                _id: { $month: '$startDates' },
                // how many tours start in a certain month
                numTourStarts: { $sum: 1 },
                // creating an array with the name of the tours
                tours: { $push: '$name' }
            }
        },
        {
            $addFields: { month: '$_id' }
        },
        {
            // Id won't show up if the val is 1 it will show up
            $project: {
                _id: 0
            }
        },
        {
            // sort by numb of tour starts, starting with the highest number
            $sort: { numTourStarts: -1 }
        },
        {
            $limit: 12
        }
    ]);

    res.status(200).json({ status: 'success', data: { plan } });
});

exports.getToursWithin = catchAsync(async (req, res, next) => {
    // Destructoring to get all the data from params
    const { distance, latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');

    // converting to radians formula: radians = distance / radius of the earth
    // first calculation is for miles and second for kilometers
    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

    if (!lat || !lng) {
        next(new AppError('Please specify the latitude and latitude and longitude in the format: lat,lng.'), 400);
    }

    const tours = await Tour.find({ startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } } });

    res.status(200).json({ status: 'success', results: tours.length, data: { data: tours } });
})

exports.getDistances = catchAsync(async (req, res, next) => {
    const { latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');

    // Multiplies in either miles or kilometers
    const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

    if (!lat || !lng) {
        next(new AppError('Please specify the latitude and latitude and longitude in the format: lat,lng.'), 400);
    }

    // geoNear must always be first and at least 1 of the fields needs to contains a geospatial index
    // if there are more than 1 geospatial indexes, a keys param must be defined and specified which one should be used
    const distances = await Tour.aggregate([
        {
            $geoNear: {
                near: {
                    // starting point
                    type: 'Point',
                    coordinates: [lng * 1, lat * 1]
                },
                // stores distances
                distanceField: 'distance',
                distanceMultiplier: multiplier
            }
        },
        {
            // gets just the distances and the name of the tours
            $project: {
                distance: 1,
                name: 1
            }
        }
    ]);

    res.status(200).json({ status: 'success', data: { data: distances } });
})