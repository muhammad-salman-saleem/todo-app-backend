const mongoose=require('mongoose');
const ProductSchema = new mongoose.Schema({
  todo: String,
    
  });

module.exports = mongoose.model("todo",ProductSchema)