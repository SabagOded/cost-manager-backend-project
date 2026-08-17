const express = require('express'); //Loads the express package and returns what it exports

const app = express(); //Creating the Express Application
const port = process.env.PORT || 3002; //localhost:3002 → Logs Service

app.get('/', (req, res) => {
    res.send('Logs Service is running');
});

app.listen(port, function(){
    console.log(`Logs Service is running on port ${port}`);
})