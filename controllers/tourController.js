const Tour = require('../models/toursSchema');
const APIFeatures = require('./../utils/apiFeatures');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');

// manipulated query string for top 5 most popular tours
exports.mostPopular = async (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
};

exports.getAllTours = catchAsync(async (req, res, next) => {
    const features = new APIFeatures(Tour.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

    const tours = await features.query;

    res.status(200).json({ status: 'success', results: tours.length, data: { tours } });
});

exports.getTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findById(req.params.id);

    if (!tour) {
        return next(new AppError('Cannot find tour with that ID', 404));
    }

    res.status(200).json({ status: 'succes', data: { tour } });
});

exports.createTour = catchAsync(async (req, res, next) => {
    const newTour = await Tour.create(req.body);

    res.status(201).json({ status: 'success', data: { tour: newTour } });
});

exports.updateTour = catchAsync(async (req, res, next) => {
    const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

    if (!updatedTour) {
        return next(new AppError('Cannot find tour with that ID', 404));
    }

    res.status(200).json({ status: 'success', data: { tour: updatedTour } });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findByIdAndDelete(req.params.id);

    if (!tour) {
        return next(new AppError('Cannot find tour with that ID', 404));
    }

    res.status(204).json({ status: 'success', data: null });
});

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