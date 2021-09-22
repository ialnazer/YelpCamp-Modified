const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const Campground = require('../models/campground');
const { isLoggedIn, validateCampground, isCampgroundAuthor, existCampground } = require('../middleware');
const campgrounds = require('../controllers/campgrounds');
const multer = require('multer');
const {storage} = require('../cloudinary')
const upload = multer({storage});//({dest: 'uploads/'})
// router.get('/', catchAsync(campgrounds.index))
// router.post('/', isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground))
router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground))
    // .post(upload.single('image'), (req, res) => {
    //     console.log(req.body, req.file)
    //     res.send('yeah')
    // })

router.get('/new', isLoggedIn, campgrounds.renderNewForm)

// router.get('/:id', catchAsync(campgrounds.showCampground))
// router.put('/:id', isLoggedIn, isCampgroundAuthor, validateCampground, catchAsync(campgrounds.updateCampground))
// router.delete('/:id', isLoggedIn, isCampgroundAuthor, catchAsync(campgrounds.deleteCampground))
router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isCampgroundAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn, isCampgroundAuthor, catchAsync(campgrounds.deleteCampground));

// router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
//     const { id } = req.params;
//     const campground = await Campground.findById(id)
//     if (!campground) {
//         req.flash('error', 'Cannot find that campground');
//         return res.redirect('/campgrounds')
//     }
//     res.render('campgrounds/edit', { campground })
// }))
router.get('/:id/edit', isLoggedIn, catchAsync(existCampground), isCampgroundAuthor, catchAsync(campgrounds.renderEditForm))

module.exports = router;