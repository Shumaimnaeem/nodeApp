const mongoose = require('mongoose');

const Product =mongoose.model('Product',{
    id: {type : Number},
    title : { type : String},
    description : {type : String}
});

module.exports = Product;