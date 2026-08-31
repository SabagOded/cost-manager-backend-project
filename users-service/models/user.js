const mongoose = require('mongoose');
const errors = require("../errors");

const userSchema = new mongoose.Schema({ // Creating a Schema object that describes User
    id: {type: Number, required: true, unique: true},
    first_name: {type: String, required: true},
    last_name: {type: String, required: true},
    birthday: {type: Date, required: true},
});

const User = mongoose.model('User', userSchema); // Creating a model that connects the schema to work with documents in MongoDB

function getAllUsers () {
    return User.find();
}
User.getAllUsers = getAllUsers;

function getUserById (id) {
    return User.findOne({id});
}
User.getUserById = getUserById;

function createUser(userData) {
    return User.create({
        id: userData.id,
        first_name: userData.first_name,
        last_name: userData.last_name,
        birthday: userData.birthday
    });
}
User.createUser = createUser;

module.exports = User; // Exports the User model for use in other modules