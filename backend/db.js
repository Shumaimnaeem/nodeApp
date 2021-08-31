const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/testDB', (err) => {
    if(!err){
        console.log("Connection Successfull");
    }
    else{
        console.log("Error in Connection");
    }
})

module.exports = mongoose;