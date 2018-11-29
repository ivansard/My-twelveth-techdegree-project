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
    Festival.find({})
          .exec( function(error, festivals){
            if(error){
              return next(error);
            } else{
              console.log(festivals);
              res.render('allFestivals', {festivals: festivals});
            }
          })
})

router.get('/:festivalName', (req, res, next) => {
    console.log(req.params.festivalName);
    Festival.findOne({name: req.params.festivalName})
          .exec( function(error, festival){
            if(error){
              return next(error);
            } else{
              console.log(festival);
              console.log(festival.longDescription);
              console.log('Here');
              res.render('festivalDetails', {festival: festival});
            }
          })
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

// PUT festivals/:festivalId
// Updates the given course
router.put('/:festivalId', (req, res, next) => {
    const festivalId = req.params.festivalId;
    console.log(festivalId);
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