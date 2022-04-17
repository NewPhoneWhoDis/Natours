process.on('uncaughtException', err => {
    console.log('Uncaught Exception!');
    console.log(err.name, err.message);
    process.exit(1);
})

const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

const mongoose = require('mongoose');

const app = require('./app');

mongoose.connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then(() => { console.log('Database connected') })

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
    console.log(`App is running on ${port}`);
});

process.on('unhandledRejection', err => {
    console.log(err.name, err.message);
    console.log('Shutting down...');
    // code 0 is success / 1 is uncalled exception
    server.close(() => {
        process.exit(1);
    })
})