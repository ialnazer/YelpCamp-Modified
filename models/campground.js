const mongoose = require('mongoose');
const Review = require('./review');
const opts = { toJSON: { virtuals: true } };

const Schema = mongoose.Schema;

const imageSchema = new Schema({
    url: String,
    filename: String
})
// imageSchema.virtual('thumbnail_hw400').get(function(){
//     return this.url.replace('/upload','/upload/w_400')
// })
imageSchema.virtual('thumbnail_w200').get(function () {
    return this.url.replace('/upload', '/upload/w_200')
})

const CampgroundSchema = new Schema({
    title: String,
    price: Number,
    description: String,
    location: String,
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    images: [imageSchema],
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, opts);

CampgroundSchema.virtual('properties.popUpMarkup').get(function () {
    return `
    <strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>
    <p>${this.description.substring(0, 20)}...</p>
    `
})

CampgroundSchema.post('findOneAndDelete', async function (campground) {
    //console.log('middleware')
    if (campground.reviews.length) {
        const res = await Review.deleteMany({ _id: { $in: campground.reviews } })
        console.log(res)
    }
})

module.exports = mongoose.model('Campground', CampgroundSchema);