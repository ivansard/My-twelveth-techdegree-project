const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const Schema = mongoose.Schema;

//Answer schema and model

const AnswerSchema = new Schema({
    text: String,
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now},
    votes: {type: Number, default: 0}
})

const Answer = mongoose.model('Answer', AnswerSchema);

//Question schema and model

const QuestionSchema = new Schema({
    text: String,
    topic: String,
    createdAt: {type: Date, default: Date.now},
    answers: [AnswerSchema]
})

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
    questions: [{type: Schema.Types.ObjectId, ref:'Question'}]
})

const Festival = mongoose.model('Festival', FestivalSchema);

// const TicketSchema = new Schema({
//     festival: {type: Schema.Types.ObjectId, ref: 'Festival'},
//     ticketNumber: {type: String},
//     ticketType: {type: String},
//     purchased: {type: Boolean},
//     reserved: {type: Boolean}
// });

// const Ticket = mongoose.model('Ticket', TicketSchema);

const UserSchema = new Schema({
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    username: {type: String, required: true, unique: true},
    emailAddress: {type: String, unique: true, required: true},
    password: {type: String, required: true},
    favoriteArtist: {type: String},
    favoriteGenres: [{type: String}]
    // paymentInfo:{
    //     creditCardNum: {type: String},
    //     zipCode: {type: String},
    //     cvv: {type: String},
    //     expirationDate: {type: Date}
    // },
    // purchasedTickets: [TicketSchema]
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

// const QuestionSchema = new Schema({
//     question: {type: String, required: true},
//     description: {type: String, required: true},
// })

// const ReservationSchema = new Schema({
//     ticket: {type: Schema.Types.ObjectId, ref: 'Ticket'},
//     user: {type: Schema.Types.ObjectId, ref: 'User'},
//     createdAt: {type: Date, default: Date.now},
//     expirationDate: {type: Date},
//     active: {type: Boolean}
// })

// const Reservation = mongoose.model('Reservation', ReservationSchema);

module.exports = {
    User: User,
    Question: Question,
    Answer: Answer,
    Festival: Festival
}