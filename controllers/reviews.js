const Campground = require('../models/campground');
const Review = require('../models/review');

module.exports.createReview = async (req, res) => {
    //console.log(req.body)
    const review = new Review(req.body.review);
    review.author = req.user._id;
    const campground = await Campground.findById(req.params.campId)
    campground.reviews.push(review);
    await campground.save()
    await review.save()
    req.flash('success', 'Created new review');
    res.redirect(`/campgrounds/${campground._id}`)
};

module.exports.deleteReview = async (req, res) => {
    //res.send('delete')
    const { campId, reviewId } = req.params;
    const campground = await Campground.findByIdAndUpdate(campId, { $pull: { reviews: reviewId } })
    const review = await Review.findByIdAndDelete(reviewId)
    req.flash('success', 'Review deleted');
    res.redirect(`/campgrounds/${campId}`)
};

module.exports.renderEditReview = async (req, res) => {
    // // here it is not true to use middleware isReviewAuthor
    // // bcz we have to verify first that the review exist
    // //res.send('edit')
    const campground = await Campground.findById(req.params.campId)
    const review = await Review.findById(req.params.reviewId)
    // if (!review) {
    //     req.flash('error', 'Cannot find review');
    //     return res.redirect(`/campgrounds/${req.params.campId}`) // to camp
    // }
    // if (!review.author.equals(req.user._id)) {
    //     req.flash('error', 'You do not have permission to do that');
    //     return res.redirect(`/campgrounds/${req.params.campId}`)
    // }
    // 3l akide fi camp w review
    res.render('reviews/edit', { campground, review })
};
module.exports.editReview = async (req, res) => {
    // res.send('update')
    const { campId, reviewId } = req.params;
    //const campground = await Campground.findByIdAndUpdate(campId, { $: { reviews: reviewId } })
    const review = await Review.findByIdAndUpdate(reviewId, req.body.review)
    req.flash('success', 'Review updated');
    res.redirect(`/campgrounds/${campId}`)
};