const express = require('express');
const router = express.Router();

//Importing models
const Question = require('../models').Question
const Answer = require('../models').Answer





router.get('/', (req, res, next) => {
    res.render('question');
})



// router.post('/:qID/answers', (req, res, next) => {
//     const questionId = req.params.qID;
//     //Retrieve the question from the database
//     Question.findById(questionId)
//     .exec( function(error, question){
//         if(error){
//             return next(error);
//         }
//         if(!question){
//             let err = new Error('Could not find question in database');
//             err.status = 400;
//             return next(err);
//         }
//         //Creating the answer
//         Answer.create(req.body, function(error, answer){
//             if(error){
//                 error.status = 400;
//                 return next(error);
//             }
//             //Adding the new answer to the question's answers array
//             question.answers.push(answer);
//             //After retrieving the question, update its answers array
//             question.set({answers: question.answers});
//             question.save(function(error, updatedQuestion){
//                 if(error){
//                         error.status = 400;
//                         return next(error);
//                 }
                
//                 //204 indicates that the request has succeeded, but that the client doesn't need to go away from its current page
//                 res.render('question', {question: updatedQuestion});
//             })
//         })
//     })
// })


module.exports = router;