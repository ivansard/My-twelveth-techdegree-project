const express = require('express');
const router = express.Router();

//Models
const User = require('../models').User;
const Festival = require('../models').Festival;

//Custom middleware
const mid = require('../middleware/index');

//Helper functions
const getCountryName = require('../util').getCountryName;

router.get('/register', mid.loggedOut, (req, res, next) => {
    return res.render('registration')
})

//GET /login
//Renders the login page for a user who wishes to log in
router.get('/login', mid.loggedOut, (req, res, next) => {
    res.render('login');
})


//POST /login
//Authenticates the users credentials, and if they are valid, renders the user's profile page
router.post('/login', (req, res, next) => {
    //Checking for the submitted credentials
    if(req.body.emailAddress && req.body.password){
        User.authenticate(req.body.emailAddress, req.body.password, function(error, user){
            if(error){
                return next(error);
            } else if(!user){
                let err = new Error('User could not be found');
                err.status = 400;
                return next(err);
            } else {
                req.session.userId = user._id;
                return res.redirect('/users/profile')
            }
        })
    } else {
        let error = new Error('Email and password are required');
        error.status = 401;
        return next(error);
    }
})

//GET /profile
//Renders the profile for the currently logged in user
router.get('/profile', mid.requiresLogin, (req, res, next) => {
    //Retrieving the logged in user from the database, so that his profile page can be rendered
    User.findById(req.session.userId)
        .exec(function(error, user){
            if(error){
                return next(error)
            } else {
                Festival.find({music: {"$in": user.favoriteGenres}})
                        .exec(function(error, genreFestivals){
                            if(error){
                                return next(error);
                            }
                            Festival.find({acts: user.favoriteArtist})
                                    .exec(function(error, artistFestivals){
                                        if(error){
                                            return next(error);
                                        }
                                        res.render('profile', {user: user,
                                                               genreFestivals:genreFestivals,
                                                               artistFestivals: artistFestivals})
                                    })
                        })
            }
        })
})

//POST /register
//After registration, the form submits to this route
router.post('/register', (req, res, next) => {
    //Confirm that all mandatory fields are there
    if(req.body.firstName && req.body.lastName
       && req.body.emailAddress && req.body.username
       && req.body.password && req.body.confirmPassword){

        User.find({})
            .select({"username": 1, "emailAddress": 1})
            .exec(function(error, data){
                if(error){
                    return next(error);
                }
                //Checking for same email or username
                data.forEach(element => {
                    if(element.emailAddress === req.body.emailAddress){
                        error = new Error('Email already in use on this site')
                        return next(error);
                    }
                    if(element.username === req.body.username){
                        error = new Error('Username already in use on this site')
                        return next(error);
                    }
                });

                 //Confirm that the user has typed the same password twice
                 if(req.body.password !== req.body.confirmPassword){
                    let error = new Error('Passwords do not match!')
                    error.status = 400;
                    return next(error);
                }

                //If the user selected a country, convert its ISO code into its name
                if(req.body.country){
                    req.body.country = getCountryName(req.body.country);
                }
                //Create a new user in the db with the data
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
       } else {
           let error = new Error('Not all mandatory fields were submitted!')
           error.status = 400;
           return next(error);
       }
})

// GET .logout
router.get('/logout', function(req, res, next){
    if(req.session){
      req.session.destroy( function(error){
          if(error){
            return next(error);
          } else {
            return res.redirect('/');
          }
      })
    }
})

module.exports = router;