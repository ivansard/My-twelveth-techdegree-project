const express = require('express');
const router = express.Router();
const axios = require('axios');

//Importing models
const Festival = require('../models').Festival;

//Importing API keys
const flickrApiKey = require('../config/config.js');

//Function which fetches data based on a search query
//This will be used for the search path
function getPhotoData(festivalName){
    //URL for the Flickr API
    const url = `https://api.flickr.com/services/rest/?api_key=${flickrApiKey}&method=flickr.photos.search&tags=${festivalName}&format=json&per_page=15&page=1&nojsoncallback=1`;

    //Using axios to get the data from flickr
    axios.get(url)
    .then(response => {
        //Fetching the photo data
        const photos = response.data.photos.photo;
        //Mapping the retrieved photo data, to the respective urls of the photos
        photos = photos.map(photo => {
            return {
            url: `http://farm${photo.farm}.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}_n.jpg`,
            id: photo.id
            }
        });
        //Returning the photo data
        return photos;
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
                //URL for the Flickr API, for searching for the festival photos
                const url = `https://api.flickr.com/services/rest/?api_key=${flickrApiKey}&method=flickr.photos.search&tags=${festival.name}&format=json&per_page=15&page=1&nojsoncallback=1`;

                //Using axios to get the data from flickr
                axios.get(url)
                .then(response => {
                    //Fetching the photo data
                    let photos = response.data.photos.photo;
                    //Mapping the retrieved photo data, to the respective urls of the photos
                    photos = photos.map(photo => {
                        return {
                        url: `http://farm${photo.farm}.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}_n.jpg`,
                        id: photo.id
                        }
                    });
                    //Rendering the view with the photos
                    festival.photos = photos;
                    console.log(festival.photos);
                    res.render('festivalDetails', {festival: festival});
                })
                .catch(function (error) {
                    return next(error);
                });
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