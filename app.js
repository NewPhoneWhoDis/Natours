if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}
const express = require('express');
const morgan = require('morgan');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const AppError = require('./utils/appError');
const errorHandler = require('./controllers/errorController');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = requrie('hpp');

const app = express();

app.use(helmet({ referrerPolicy: { policy: "no-referrer" }, }));

if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
}

// Allows 100 requests from the same ip in 1 hour
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP, chill out!'
})

app.use('/api', limiter);

// Body parser that reads data from the body
app.use(express.json({ limit: '10kb' }));

// Data sanitization agains NoSQL query injection
app.use(mongoSanitize());

// Data sanitization agains XSS
app.use(xss());

// Preventing Parameter Pollution /always use at the end because it clears the query string
app.use(hpp({
    whitelist: [
        'duration',
        'ratingsQuantity',
        'ratingsAverage',
        'maxGroupSize',
        'difficulty',
        'price'
    ]
}));

// Serve static files
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
})

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
    next(new AppError(`Can't find this url ${req.originalUrl} on this server!`, 404));
})

// Error handler
app.use(errorHandler);

module.exports = app;