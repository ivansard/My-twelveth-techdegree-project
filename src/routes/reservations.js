const express = require('express');
const router = express.Router();

const Reservation = require('../models').Reservation;

router.post('/', (req, res, next) => {
    Reservation.create(req.body, function(error, newReservation){
        if(error){
            error.status = 400;
            return next(error);
        }
        return res.json(newReservation); 
    })
})



module.exports = router;