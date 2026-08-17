const express = require('express'); //Loads the express package and returns what it exports

const app = express(); //Creating the Express Application
const port = process.env.PORT || 3003; //localhost:3003 → Team Service

app.get('/', (req, res) => {
    res.send('Team Service is running');
});

app.listen(port, function(){
    console.log(`Logs Service is running on port ${port}`);
})
