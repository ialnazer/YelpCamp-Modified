const User = require('../models/user');

module.exports.renderRegister = (req, res) => {
    res.render('users/register')
};
module.exports.register = async (req, res, next) => {
    //res.send(req.body)
    try {
        const { username, email, password } = req.body;
        const user = new User({ username, email });
        const registeredUser = await User.register(user, password);
        //console.log(registeredUser)
        req.login(registeredUser, err => {
            if (err) return next(err)
            req.flash('success', 'Welcom to Yelp Camp!')
            res.redirect('/campgrounds')
        })
    } catch (error) {
        req.flash('error', error.message);
        res.redirect('/register')
    }
};

module.exports.renderLogin = (req, res) => {
    res.render('users/login')
}
module.exports.login = (req, res) => {
    req.flash('success', 'Welcom back!');
    const redirectUrl = req.session.returnTo || '/campgrounds'
    delete req.session.returnTo
    res.redirect(redirectUrl);
}
module.exports.logout = (req, res) => {
    req.logout();
    req.flash('success', 'Goodbye!')
    res.redirect('/campgrounds')
};