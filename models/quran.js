const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { DateTime } = require('luxon');


const QuranPageSchema = new mongoose.Schema({
  page: Number, // رقم الصفحة (1 إلى 604)
  file_id: String,
});


module.exports = mongoose.model("QuranPage", QuranPageSchema);