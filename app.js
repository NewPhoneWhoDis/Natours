const express = require('express');
const fs =require('fs');

const app = express();

app.get('/', (req, res) => {
    res.json({ message: 'Hello form the backend', app: 'Natours'});
})

const tours = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`));

app.get('/api/v1/tours', (req, res) => {
    res.json({
        results: tours.length,
        data: {
            tours: tours
        }
    });
})


const port = 3000;
app.listen(port, () => {
    console.log(`App is running on ${port}`);
})