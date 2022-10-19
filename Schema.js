const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
    item_id:Number,
    item:String,
    price:Number,
    from:String,
    category:String
  });

  module.exports=Schema