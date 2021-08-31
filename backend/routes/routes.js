const express = require('express');
var mongoose = require('mongoose');
const router = express.Router();
const Product = require('../models/products');


router.get('/getAllProducts', async(req,res) => {
    Product.find(function (err, products) {
        if (err) return next(err);
        res.json(products);
      });
})



router.post('/addProduct', async(req,res) => {
    console.log('inside add product');
    let id = Math.floor((Math.random() * 100) + 1);
    let product = new Product({
        id: id,
        title : req.body.title,
        description : req.body.description
    })

    await product.save((err,doc) => {
        if(err){
            console.log("err: ", err);
        }
        else{
            res.send(doc);
        }
    });
})
router.get('/getProductById/:id', async(req, res) => {
    console.log("Req: ", req.params)
    Product.find({'id' : req.params.id},function (err, product) {
        if (err) 
            console.log("err: ", err);
        res.json(product);
      });
})
router.delete('/deleteProduct/:id', async(req, res) => {
    console.log('del: ',req.params.id )
    Product.findOneAndRemove({'id':req.params.id}, req.body, function (err, post) {
        if (err) 
            console.log("err: ", err);
        res.json(post);
      });
})
router.patch('/editProduct', async(req,res) => {
    console.log('inside edit product');

    let id = req.body.id;
    console.log("Id: ", id)
    Product.findOneAndUpdate({'id' : req.body.id}, req.body, function (err, post) {
        if (err) 
        return next(err);
        res.json(post);
      });
})


module.exports = router;
