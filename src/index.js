const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');




//Application instantiation 
const app = express();

// Setting up mongoose
mongoose.connect('mongodb://localhost:27017/capstone-project');
const db = mongoose.connection;

db.on('error', error => {
  console.log('Connection error:', error);
})

db.once('open', () => {
  console.log('Db connection successful');
})

//Adding sessions
app.use(session({
    secret: 'Capstone project',
    resave: true,
    saveUninitialized: false
  }))
  

//Adding body-parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Importing and setting route handlers

const festivals = require('./routes/festivals');
const users = require('./routes/users');
const questions = require('./routes/questions');

app.use('/festivals', festivals);
app.use('/users', users);
app.use('/questions', questions);

//Accessing static server
app.use('/static', express.static('public'))

//Setting pug as view engine
app.set('view engine', 'pug');

app.get('/', (req, res, next) => {
    res.render('home');
})

// global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
      message: err.message,
      error: {}
    });
});
  
//Setting up app on port 3000
app.listen(3000, 'localhost', () => {
    console.log('Server running on port 3000');
})