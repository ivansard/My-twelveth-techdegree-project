const express = require('express');
const router = express.Router();

const Festival = require('../models').Festival;

router.get('/', (req, res, next) => {
    res.render('allFestivals')
})

router.post('/', (req, res, next) => {
    Festival.create(req.body, function(error, newFestival){
        if(error){
            error.status = 400;
            return next(error);
        }
        return res.json(newFestival); 
    })
})



module.exports = router;