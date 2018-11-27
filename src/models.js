const mongoose = require('mongoose');

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
    name: {type: String},
    location: {type: String},
    country: {type: String},
    description: {type: String},
    // startDate: {type: Date},
    // endDate: {type: Date},
    // totalTicketsRegular: {type: Number},
    // totalTicketsVip: {type: Number},
    // soldTicketsRegular: {type: Number, default: 0},
    // soldTicketsVip: {type: Number, default: 0},
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