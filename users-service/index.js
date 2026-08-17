const express = require('express'); //Loads the express package and returns what it exports

const app = express(); //Creating the Express Application
const port = process.env.PORT || 3000; //localhost:3000 → Users Service

app.get('/', function (req, res) {
    res.send('Users service is running');
});

app.listen(port, function(){
    console.log(`Server is running on port ${3000}`);
})