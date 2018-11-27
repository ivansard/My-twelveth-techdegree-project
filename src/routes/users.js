const express = require('express');
const router = express.Router();

const User = require('../models').User;

const getCountryName = require('../util').getCountryName;




router.get('/register', (req, res, next) => {
    res.render('registration')
})

//GET /profile
//Renders the profile for the currently logged in user
router.get('/profile', (req, res, next) => {
    //Checking if the user is logged in
    if(!req.session.userId){
        const error = new Error('You must be logged in to view this page');
        error.status = 403;
        return next(error);
    } else {
        //Retrieving the logged in user from the database, so that his profile page can be rendered
        User.findById(req.session.userId)
            .exec(function(error, user){
                if(error){
                    return next(error)
                } else {
                    res.render('profile', {user: user})
                }
            })
    }
})

//POST /register
//After registration, the form submits to this route
router.post('/register', (req, res, next) => {
    //VALIDATION OF THE DATA STILL NEEDED HERE!!
    req.body.country = getCountryName(req.body.country);
    //Create a new user in the db with the data
    console.log(req.body);
    User.create(req.body, function(error, newUser){
        if(error){
            return next(error);
        }
        if(!newUser){
            let err = new Error('Issue creating user in db')
            err.status = 400;
            return next(err);
        }
        req.session.userId = newUser._id;
        return res.redirect('/users/profile');
    })

})

router.post('/', (req, res, next) => {
    User.create(req.body, function(error, newUser){
        if(error){
            error.status = 400;
            return next(error);
        }
        return res.json(newUser); 
    })
})



module.exports = router;