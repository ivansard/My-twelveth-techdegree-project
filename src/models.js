const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const Schema = mongoose.Schema;

//Method for sorting answers based on their number of votes first,
//and secondly based on their creation date 
const sortAnswers = function(ans1, ans2){
    // - negative : ans1 goes before ans2
    // 0 : no change
    // + positive: ans2 goes before ans1
    if(ans1.votes === ans2.votes){
        return ans2.createdAt - ans1.createdAt
    }
    return ans2.votes - ans1.votes
}

const UserSchema = new Schema({
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    username: {type: String, required: true},
    emailAddress: {type: String, required: true},
    password: {type: String, required: true},
    favoriteArtist: {type: String},
    favoriteGenres: [{type: String}]
})

//Method for authenticating a user 
UserSchema.statics.authenticate = function(email, password, callback){
    //Find the document with the users email address
    User.findOne({emailAddress: email})
        .exec(function(error, user){
            if(error){
                return callback(error);
            } else if(!user){
                let errorNoUser = new Error('A user with the submitted email does not exist');
                errorNoUser.status = 401;
                return callback(errorNoUser);
            }
            //If we get to here, there is a user with the given email, so we will check his password
            bcrypt.compare(password, user.password, function(error, result){
                //Compare returns an error, or a boolean value
                if(result === true){
                    //In node, the structure of a callback is (error, result)
                    //Here the error is set to null, because there are is no error
                    console.log('No error with password validation');
                    return callback(null, user)
                } else {
                    console.log('Error with password validation');
                    return callback()
                }
            })
        })
}

//Hash password before save into db
UserSchema.pre('save', function(next){
    //this == object we have created, and is about to be inserted into DB
    const user = this;
    //Hashing password
    //First argument - the password the user gave
    //Second argument - how many times to run the encryption algorithm
    //Third - callback which is run after the password is hashed
    bcrypt.hash(user.password, 10, function(error, hash){
        if(error){
            return next(error)
        }
        user.password = hash;
        //Pozivamo sledecu funkciju u middleware stack-u, u ovom slucaju mongovu funkciju koja cuva user-a
        next();
    })
})

const User = mongoose.model('User', UserSchema);

//Answer schema and model

const AnswerSchema = new Schema({
    answerText: String,
    user: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now},
    votes: {type: Number, default: 0}
})

const Answer = mongoose.model('Answer', AnswerSchema);

//Question schema and model

const QuestionSchema = new Schema({
    questionText: {type: String, required: true},
    description: {type: String},
    topic: String,
    createdAt: {type: Date, default: Date.now},
    user: {type: UserSchema},
    festival: {type: Schema.Types.ObjectId, ref: 'Festival'},
    answers: [AnswerSchema]
})

QuestionSchema.pre('save', function(next){
    this.answers.sort(sortAnswers);
    next();
})

//OVO JE ON DELETE CASCADE - POGLEDAJ JOS KAKO TREBA DA SE ODRADI, JEBE STO JE NIZ
// QuestionSchema.pre('remove', function(next) {
//     // Remove all the assignment docs that reference the removed person.
//     this.model('Assignment').remove({ person: this._id }, next);
// });

const Question = mongoose.model('Question', QuestionSchema);

//Festival schema and model

const FestivalSchema = new Schema({
    name: {type: String, unique: true},
    location: {type: String},
    country: {type: String},
    shortDescription: {type: String},
    longDescription: {type: String},
    music: [{type: String}],
    acts: [{type: String}],
    thumbnailImage: {type: String},
    jumbotronImage: {type: String},
    eurTicketPrice: {type: Number},
    // questions: [{type: QuestionSchema}]
})

const Festival = mongoose.model('Festival', FestivalSchema);

module.exports = {
    User: User,
    Question: Question,
    Answer: Answer,
    Festival: Festival
}