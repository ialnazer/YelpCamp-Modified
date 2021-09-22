const express = require('express');
const router = express.Router({ mergeParams: true });
const catchAsync = require('../utils/catchAsync');
const Campground = require('../models/campground');
const Review = require('../models/review');
const { campgroundSchema, reviewSchema } = require('../schemas');
const ExpressError = require('../utils/ExpressError');
const { validateReview, isLoggedIn, isReviewAuthor, existReview } = require('../middleware');
const reviews = require('../controllers/reviews')

router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview))

// router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))
// router.put('/:reviewId', isLoggedIn, isReviewAuthor, validateReview, catchAsync(reviews.editReview))
router.route('/:reviewId')
    .delete(isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))
    .put(isLoggedIn, isReviewAuthor, validateReview, catchAsync(reviews.editReview))

router.get('/:reviewId/edit', isLoggedIn, catchAsync(existReview), isReviewAuthor, catchAsync(reviews.renderEditReview))

module.exports = router;