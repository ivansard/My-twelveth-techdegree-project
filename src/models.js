const mongoose = require('mongoose');

const Schema = mongoose.Schema;

//Festival schema and model

const FestivalSchema = new Schema({
    name: {type: String},
    country: {type: String},
    description: {type: String},
    startDate: {type: Date},
    endDate: {type: Date},
    totalTicketsRegular: {type: Number},
    totalTicketsVip: {type: Number},
    soldTicketsRegular: {type: Number, default: 0},
    soldTicketsVip: {type: Number, default: 0},
    acts: [{type: String}]
})

const Festival = mongoose.model('Festival', FestivalSchema);

const TicketSchema = new Schema({
    festival: {type: Schema.Types.ObjectId, ref: 'Festival'},
    ticketNumber: {type: String},
    ticketType: {type: String},
    purchased: {type: Boolean},
    reserved: {type: Boolean}
});

const Ticket = mongoose.model('Ticket', TicketSchema);

const UserSchema = new Schema({
    name: {type: String, required: true},
    surname: {type: String, required: true},
    emailAddress: {type: String, required: true},
    password: {type: String, required: true},
    paymentInfo:{
        creditCardNum: {type: String},
        zipCode: {type: String},
        cvv: {type: String},
        expirationDate: {type: Date}
    },
    purchasedTickets: [TicketSchema]
})

const User = mongoose.model('User', UserSchema);

const ReservationSchema = new Schema({
    ticket: {type: Schema.Types.ObjectId, ref: 'Ticket'},
    user: {type: Schema.Types.ObjectId, ref: 'User'},
    createdAt: {type: Date, default: Date.now},
    expirationDate: {type: Date},
    active: {type: Boolean}
})

const Reservation = mongoose.model('Reservation', ReservationSchema);

module.exports = {
    User: User,
    Ticket: Ticket,
    Reservation: Reservation,
    Festival: Festival
}