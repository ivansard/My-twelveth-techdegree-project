const express = require('express');
const router = express.Router();

const Festival = require('../models').Festival;

//Function which fetches data based on a search query
//This will be used for the search path
function setPhotoData(festivalName){
    const url = `https://api.flickr.com/services/rest/?api_key=${apiKey}&method=flickr.photos.search&tags=${searchTag}&format=json&per_page=24&page=1&nojsoncallback=1`;

    axios.get(url)
    .then(response => {
      //Fetching the photo data
      const photos = response.data.photos.photo;
      //Setting the photos, current search tag and the loading indicator in the state
      this.setState( prevState => {
        return {
          photos: photos,
          currentSearchTag: searchTag,
          loading: false
        }
      })
    })
    .catch(function (error) {
      console.log('Error fetching data from Flickr', error);
    });
  }

router.get('/', (req, res, next) => {
    res.render('allFestivals')
})

router.get('/:pera', (req, res, next) => {
    res.render('festivalDetails')
})



router.post('/', (req, res, next) => {
    Festival.create(req.body, function(error, newFestival){
        if(error){
            error.status = 400;
            return next(error);
        }
        return res.json(newFestival); 
    })
})



module.exports = router;