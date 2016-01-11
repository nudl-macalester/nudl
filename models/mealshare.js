var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var mealshareSchema = new Schema({
    name: String,
    description: String,
    creator: {type: Schema.Types.ObjectId, ref:'User'},
    hosts: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    guests: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    time: Date,
    max_guests: Number
});

var Mealshare = mongoose.model('Mealshare', mealshareSchema);

module.exports = {
    Mealshare: Mealshare
};