const express = require('express');
const bodyParser = require('body-parser');

const app = express();

//Adding body-parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Setting pug as view engine
app.set('view engine', 'pug');

app.get('/', (req, res, next) => {
    res.render('home');
})


//Setting up app on port 3000
app.listen(3000, 'localhost', () => {
    console.log('Server running on port 3000');
})