const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({ // Creating a Schema object that describes User
    id: {type: Number, required: true, unique: true},
    first_name: {type: String, required: true},
    last_name: {type: String, required: true},
    birthday: {type: Date, required: true},
});

const User = mongoose.model('User', userSchema); // Creating a model that connects the schema to work with documents in MongoDB

module.exports = User; // Exports the User model for use in other modules