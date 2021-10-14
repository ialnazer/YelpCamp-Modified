const cities = require('./cities');
const { descriptors, places } = require('./seedHelpers');
const mongoose = require('mongoose');
const Campground = require('../models/campground');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = 'pk.eyJ1IjoiaWFsbmF6ZXIiLCJhIjoiY2t0b2g2ejdhMDZmMjJvbDgwamExc3o2aCJ9.95unKn5g59zez4dtWupcow'// process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken })

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
  useNewUrlParser: true,
  // useCreateIndex: true,
  useUnifiedTopology: true
})
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Database Connected')
});

// function to pick a random element from an array
const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 50; i++) {
    //const random1000 = Math.floor(Math.random() * cities.length);
    const price = Math.floor(Math.random() * 20) + 10;
    const location = `${sample(cities).city}, ${sample(cities).state}`;
    const geoData = await geocoder.forwardGeocode({
      query: location,
      limit: 1
    }).send();
    //res.send(geoData.body.features[0].geometry.coordinates)    
    if (!geoData.body.features[0]) {
      return console.log('error Location Not Valid');
    }
    //console.log(geoData.body.features[0].geometry)
    const camp = new Campground({
      location: location,
      title: `${sample(descriptors)} ${sample(places)}`,
      images: [
        {
          url: 'https://res.cloudinary.com/douqbebwk/image/upload/v1600060601/YelpCamp/ahfnenvca4tha00h2ubt.png',
          filename: 'YelpCamp/ahfnenvca4tha00h2ubt'
        },
        {
          url: 'https://res.cloudinary.com/douqbebwk/image/upload/v1600060601/YelpCamp/ruyoaxgf72nzpi4y6cdi.png',
          filename: 'YelpCamp/ruyoaxgf72nzpi4y6cdi'
        }
      ],//'https://source.unsplash.com/collection/483251',
      description: 'an amazing place to camp',
      price: price,
      author: '6144a7ed2c164d216a4935fe',
      geometry: {
        type: 'Point',
        coordinates: geoData.body.features[0].geometry.coordinates // bas nhna bl file cities 3ena l long wl lat !!!!!!!!!!!!!!!!!!!!!!! Ahhhhhhhh 
      }

    })
    await camp.save();
  }
}

seedDB().then(() => {
  mongoose.connection.close();
})
