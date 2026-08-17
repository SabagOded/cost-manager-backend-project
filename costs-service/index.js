const express = require('express'); //Loads the express package and returns what it exports

const app = express(); //Creating the Express Application
const port = process.env.PORT || 3001; //localhost:3001 → Costs Service

app.get('/', (req, res) => {
    res.send('Costs Service is running')
});

app.listen(port, function(){
    console.log(`Costs Service is running on port ${port}`);
})