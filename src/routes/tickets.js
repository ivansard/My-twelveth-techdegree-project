const express = require('express');
const router = express.Router();

const Ticket = require('../models').Ticket;

router.post('/', (req, res, next) => {
    Ticket.create(req.body, function(error, newTicket){
        if(error){
            error.status = 400;
            return next(error);
        }
        return res.json(newTicket); 
    })
})



module.exports = router;