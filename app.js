if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}
const express = require('express');
const morgan = require('morgan');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const AppError = require('./utils/appError');
const errorHandler = require('./controllers/errorController');

const app = express();

if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
}

app.use(express.json());
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