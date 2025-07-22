const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    id: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: false,
    },
    first_name: {
        type: String,
        required: false,
    },
    sub_day: {
        type: String,
        required: true,
    }
    
});
const User = mongoose.model('user', userSchema);
module.exports = User;