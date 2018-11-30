const express = require('express');
const router = express.Router();
const axios = require('axios');

//Importing models
const Festival = require('../models').Festival;
const Question = require('../models').Question;
const User = require('../models').User;

//Importing API keys
const flickrApiKey = require('../config/config.js');

// GET /festivals
router.get('/', (req, res, next) => {
    Festival.find({})
          .exec( function(error, festivals){
            if(error){
              return next(error);
            } else{
              res.render('allFestivals', {festivals: festivals});
            }
          })
})

//GET /festivals/:festivalName
//Renders the page with details about a specific festival
router.get('/:festivalName', (req, res, next) => {

    Festival.findOne({name: req.params.festivalName})
            .exec( function(error, festival){
            if(error){
                return next(error);
            } else{
                //URL for the Flickr API, for searching for the festival photos
                const url = `https://api.flickr.com/services/rest/?api_key=${flickrApiKey}&method=flickr.photos.search&tags=${festival.name}&format=json&per_page=15&page=1&nojsoncallback=1`;
                //Using axios to get the data from flickr
                axios.get(url)
                .then(response => {
                    //Fetching the photo data
                    let photos = response.data.photos.photo;
                    //Mapping the retrieved photo data, to the respective urls of the photos
                    photos = photos.map(photo => {
                        return {
                        url: `http://farm${photo.farm}.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}_n.jpg`,
                        id: photo.id
                        }
                    });
                    // Assigning the photos to the festival
                    festival.photos = photos;
                    res.render('festivalDetails', {festival: festival});
                })
                .catch(function (error) {
                    return next(error);
                });
            }
            })

            
})

//POST /festivals/:festivalName
router.post('/:festivalName', (req, res, next) => {
    //Check if everything was submitted on the form
    if(req.body.questionText && req.body.description && req.body.topic){
        //Finding the user in the db based on the session's user ID
        User.findById(req.session.userId)
            .exec( function(error, user){
                req.body.user = user;
                Question.create(req.body, function(error, newQuestion){
                    if(error){
                        return next(error);
                    }
                    if(!newQuestion){
                        let err = new Error('Issue creating question in db')
                        err.status = 400;
                        return next(err);
                    }
                    //Find the festival for which the question was asked
                    Festival.findOne({name: req.params.festivalName}, function(error, festival){
                        if(error){
                            return next(error);
                        } else if(!festival){
                            let err = new Error('Cannot find festival in database')
                            err.status = 400;
                            return next(err);
                        }
                        //Add the question's id to the array on the festival
                        festival.questions.push(newQuestion);
                        //Update the festival in the database
                        festival.set({questions: festival.questions});
                        festival.save(function(error, updatedFestival){
                            if(error){
                                    error.status = 400;
                                    return next(error);
                            }
                            //Render the festival details page again
                            res.redirect(`/festivals/${festival.name}`)
                        })
                    })
                })
            })
    } else {
        let error = new Error('Please fulfill all information about your question');
        error.status = 401;
        return next(error);
    }
})


//Route for creating a new festival - USED ONLY WITH POSTMAN
router.post('/', (req, res, next) => {
    Festival.create(req.body, function(error, newFestival){
        if(error){
            error.status = 400;
            return next(error);
        }
        return res.json(newFestival); 
    })
})

// PUT festivals/:festivalId
// Updates the given course
router.put('/:festivalId', (req, res, next) => {
    const festivalId = req.params.festivalId;
    console.log(festivalId);
    //Based on the query parameters festivalId, retrieve the specific course
    Festival.findById(festivalId)
        .exec(function(error, festival){
            //If the festival is null/undefined, the submitted id is wrong
            if(!festival){
                let err = new Error('Festival with submitted id does not exist in db')
                err.status = 400;
                return next(err);
            }
            //If there was an error, send it back to the user
            if(error){
                error.status = 404;
                return next(error);
            } else {
                //After retrieving the festival, set its data to the request body
                festival.set(req.body);
                festival.save(function(error, updatedFestival){
                    if(error){
                            error.status = 400;
                            return next(error);
                    }
                    //204 indicates that the request has succeeded, but that the client doesn't need to go away from its current page
                    return res.json(updatedFestival)
                })
            }
        })
})



module.exports = router;