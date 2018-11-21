const express = require('express');

const app = express();


//Setting up app on port 3000
app.listen(3000, 'localhost', () => {
    console.log('Server running on port 3000');
})