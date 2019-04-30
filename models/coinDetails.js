var mongoose = require('mongoose');

// User Schema creation ........................................
var CoinSchema = mongoose.Schema({
    coinname:{
        type: String,
        index: true
    },
    price: {
        type: String
    },
    datetime:{
      type: String
    }
});


module.exports = mongoose.model('CoinDetails', CoinSchema);  // 'CoinDetails' hocce collection name ...

module.exports.createCoinDetails = function(newDetails, callback){
    newDetails.save(callback);
}
