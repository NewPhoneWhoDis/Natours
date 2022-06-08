if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}
const express = require('express');
const morgan = require('morgan');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const AppError = require('./utils/appError');
const errorHandler = require('./controllers/errorController');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const path = require('path');
const cookieParser = require('cookie-parser');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(helmet());


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

// Cookie parser
app.use(cookieParser());

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

app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
})

//* Routes

app.use('/', viewRouter);

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
    next(new AppError(`Can't find this url ${req.originalUrl} on this server!`, 404));
})

// Error handler
app.use(errorHandler);

module.exports = app;