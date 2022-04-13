const express = require('express');

const app = express();

app.get('/', (req, res) => {
    res.json({ message: 'Hello form the backend', app: 'Natours'});
})




const port = 3000;
app.listen(port, () => {
    console.log(`App is running on ${port}`);
})