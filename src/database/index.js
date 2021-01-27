const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://rennan:<password>@cluster0.bq15o.mongodb.net/<dbname>?retryWrites=true&w=majority',{useMongoClient:true});
mongoose.Promise = global.Promise;
module.exports = mongoose;
