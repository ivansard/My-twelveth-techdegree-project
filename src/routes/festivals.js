const express = require('express');
const router = express.Router();
const axios = require('axios');

//Importing models
const Festival = require('../models').Festival;
const Question = require('../models').Question;
const User = require('../models').User;
const Answer = require('../models').Answer

//Importing API keys
const flickrApiKey = require('../config/config.js');

//Setting the currently selected question in the request object
router.param("qID", function(req, res, next, qID){
    Question.findById(req.params.qID, function(error, document){
        if(error){
            return next(error)
        }
        if(!document){
            error = new Error("Not found")
            error.status = 404;
            return next(error);
        }
        req.question = document;
        return next();
    })
})
//Setting the current answer in the request object
router.param("aID", function(req, res, next, aID){
    req.answer = req.question.answers.id(aID);
    if(!req.answer){
        const error = new Error("Not found")
        error.status = 400;
        return next(error);
    }
    next();
})

//Setting the current festival in the request object
router.param("festivalName", (req, res, next, festivalName) =>{
    Festival.findOne({name: festivalName})
            .exec(function(error, document){
                if(error){
                    return next(error)
                }
                if(!document){
                    error = new Error("Not found")
                    error.status = 404;
                    return next(error);
                }
                req.festival = document;
                return next();
            })
})

// GET /festivals
// Retrieves all festivals from the database and renders them
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
    const festival = req.festival
    //Find all the questions associated with the festival
    Question.find({festival: festival._id})
            .exec(function(error, questions){
                if(error){
                    return next(error);
                }
                if(!questions){
                    let err = new Error('Issue retrieving questions from DB');
                    err.status = 400;
                    return next(err)
                }
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
                    res.render('festivalDetails', {festival: festival, questions: questions});
                })
                .catch(function (error) {
                    return next(error);
                });
            })
                
})

//POST /festivals/:festivalName
//Method for posting a question to a specific festival
router.post('/:festivalName', (req, res, next) => {
    //Getting the specified festival
    const festival = req.festival
    //Check if everything was submitted on the form
    if(req.body.questionText && req.body.description && req.body.topic){
        //Finding the user in the db based on the session's user ID
        User.findById(req.session.userId)
            .exec( function(error, user){
                //Setting the user and festival on the request body
                req.body.user = user;
                req.body.festival = festival
                Question.create(req.body, function(error, newQuestion){
                    if(error){
                        return next(error);
                    }
                    if(!newQuestion){
                        let err = new Error('Issue creating question in db')
                        err.status = 400;
                        return next(err);
                    }
                    res.redirect(`/festivals/${festival.name}`)
                })
            })
    } else {
        let error = new Error('Please fulfill all information about your question');
        error.status = 401;
        return next(error);
    }
})

//GET /:festivalName/questions/:qID
//Returns the page about a specific question
router.get('/:festivalName/questions/:qID', (req, res, next) => {
    const questionId = req.params.qID;
    //Retrieve the question from the database
    Question.findById(questionId)
            .populate({
                path: 'answers.user',
                model: 'User'
            })
            .exec( function(error, question){
                if(error){
                    return next(error);
                }
                if(!question){
                    let err = new Error('Could not find question in database');
                    err.status = 400;
                    return next(err);
                }
                console.log('Hopefully question with answers and users', question);
                res.render('question', {question: question, festival: req.festival});
            })
})

//POST /festivals/:festivalName/questions/:qID/answers
//Route which posts an answer to a question
router.post('/:festivalName/questions/:qID/answers', (req, res, next) =>{
    const question = req.question;
    req.body.user = req.session.userId;
    //Creating the answer
    Answer.create(req.body, function(error, answer){
        if(error){
            error.status = 400;
            return next(error);
        }
        //Adding the new answer to the question's answers array
        question.answers.push(answer);
        //After retrieving the question, update its answers array
        question.set({answers: question.answers});
        question.save(function(error, updatedQuestion){
            if(error){
                    error.status = 400;
                    return next(error);
            }
            res.redirect(`/festivals/${req.festival.name}/questions/${req.question._id}`)
            // res.render('question', {question: updatedQuestion, festival: req.festival});
        })
    })
})

//POST /festivals/:festivalName/:qID/answers/:aID/vote-:dir
//Route which allows users to up or down vote on an answer
router.get('/:festivalName/questions/:qID/answers/:aID/vote-:dir', (req, res, next) =>{
    //Validating that the :dir parameter is either up or down
    if(req.params.dir.search(/^(up|down)$/) === -1){
        let error = new Error('Not found');
        error.status = 404;
        next(error);
    } else {
        const vote = req.params.dir;
        const question = req.question;
        const answer = req.answer;
        //Finding the answer in the questions array
        question.answers.forEach(questionAnswer => {
            if(answer._id.equals(questionAnswer._id)){
                //Adding or subtracting votes
                if(vote === 'up'){
                    questionAnswer.votes++;
                    console.log(questionAnswer);
                } else {
                    questionAnswer.votes--;
                    console.log(questionAnswer);
                }
                //Updating the question
                question.set({answers: question.answers});
                question.save(function(error, updatedQuestion){
                    if(error){
                            error.status = 400;
                            return next(error);
                    }
                    console.log(updatedQuestion);
                    res.redirect(`/festivals/${req.festival.name}/questions/${req.question._id}`)
                })
            }
        });
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
// Updates the given course - USED ONLY WITH POSTMAN
router.put('/:festivalId', (req, res, next) => {
    const festivalId = req.params.festivalId;
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