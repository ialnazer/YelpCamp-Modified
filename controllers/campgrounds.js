const Campground = require('../models/campground');
const { cloudinary } = require('../cloudinary');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const { token } = require('morgan');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken })


//setting up number of items to be fetched per page
const getPagination = (_page, _limit) => {
    const limit = _limit ? +_limit : 20;
    const offset = _page ? _page * limit : 0;

    return { limit, offset };
};

//get paginated data and organise it into totalItems, items, totalPages, currentPage
const getPagingData = (data, page, limit) => {
    const { count: totalItems, rows: items } = data;
    const currentPage = page ? +page : 0;
    const totalPages = Math.ceil(totalItems / limit);

    return { totalItems, items, totalPages, currentPage };
};

module.exports.index = async (req, res) => {
    const allCampgrounds = await Campground.find();
    const { page = 1, limit = 3 } = req.query;
    const campgrounds = await Campground.find() // length will be = limit
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();//= await Campground.find()
    // if (page == 1 && campgrounds.length == 0) {
    //     // No Camps at all
    //     req.flash('error', 'Cannot find campgrounds');
    //     return res.redirect('/') // to homepage
    // }
    // get page count and current page
    const campgroundCount = allCampgrounds.length
    const campgroundPageCount = Math.ceil(campgroundCount / limit)
    // server side page protection
    if (page != 1 && campgrounds.length == 0) {
        // No more pages
        req.flash('error', 'No more campgrounds');
        return res.redirect('/campgrounds') // to campgrounds page 1 (default value of page is 1)
    }
    res.render('campgrounds/index.ejs', { allCampgrounds, campgrounds, currentPage: parseInt(page), campgroundPageCount });
};

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
};

module.exports.createCampground = async (req, res) => {
    //res.send(req.body.campground)
    //if (!req.body.campground) next(new ExpressError('no camp', 400))
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send();
    //res.send(geoData.body.features[0].geometry.coordinates)    
    if (!geoData.body.features[0]) {
        req.flash('error', 'Location Not Valid');
        return res.redirect('/campgrounds/new')
    }
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry;
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.author = req.user._id;
    await campground.save()
    //console.log(campground)
    req.flash('success', 'Successfully made campground');
    res.redirect(`/campgrounds/${campground._id}`)
};

module.exports.showCampground = async (req, res) => {
    const { page = 1, limit = 5 } = req.query;
    const { id } = req.params;
    // const campground = await Campground.findById(id).populate('reviews').populate('author')
    const campground = await Campground.findById(id).populate(
        {
            path: 'reviews',
            //perDocumentLimit: 2,
            limit: limit * 1,
            skip: (page - 1) * limit,
            populate: {
                path: 'author'
            }
        }
    ).populate('author')
    // the campground.reviews length will be = limit
    if (!campground) {
        req.flash('error', 'Cannot find that campground');
        return res.redirect('/campgrounds')
    }

    const campgroundWithAllReviews = await Campground.findById(id)
    const reviewCount = campgroundWithAllReviews.reviews.length
    const reviewPageCount = Math.ceil(reviewCount / limit)
    //console.log(reviewCount)
    if (page != 1 && campground.reviews.length == 0) {
        // No more reviews
        req.flash('error', 'No more reviews');
        return res.redirect(`/campgrounds/${id}?page=1`) // to the same campground with review page 1
    }
    res.render('campgrounds/show', { campground, currentReviewPage: parseInt(page), reviewPageCount })

};

module.exports.renderEditForm = async (req, res) => {
    // // here it is not true to use middleware isCampgroundAuthor
    // // bcz we have to verify first that the camp exist 
    const { id } = req.params;
    const campground = await Campground.findById(id)
    // if (!campground) {
    //     req.flash('error', 'Cannot find that campground');
    //     return res.redirect('/campgrounds')
    // }
    // if (!campground.author.equals(req.user._id)) {
    //     req.flash('error', 'You do not have permission to do that');
    //     return res.redirect(`/campgrounds/${id}`)
    // }
    // hala2 hun sar fi run la 3 middlewares abl ma yusal la hun (isloggedin, existcampground, iscampgroundauthor)
    // yaene lema yusal la hun 3l akid rah ykun fi camp
    res.render('campgrounds/edit', { campground })
};

module.exports.updateCampground = async (req, res) => {
    //console.log(req.body)
    //res.send('put')
    const { id } = req.params;
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send();
    if (!geoData.body.features[0]) {
        req.flash('error', 'Location Not Valid');
        return res.redirect(`/campgrounds/${id}/edit`)
    }
    const camp = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    camp.geometry = geoData.body.features[0].geometry;
    camp.images.push(...req.files.map(f => ({ url: f.path, filename: f.filename })));
    await camp.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename)
        }
        await camp.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
        //console.log(camp)
    }
    req.flash('success', 'Successfully updated campground');
    res.redirect(`/campgrounds/${camp._id}`)
};

module.exports.deleteCampground = async (req, res) => {
    //res.send('delete')
    const { id } = req.params;
    const camp = await Campground.findByIdAndDelete(id)
    req.flash('success', 'Deleted campground');
    res.redirect('/campgrounds/')
};
