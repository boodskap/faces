
var Routes = function (app) {

    this.app = app;
    this.init();



};
module.exports = Routes;


Routes.prototype.init = function () {

    var self = this;

    var roleCheck = function (req, res, next) {
        var userObj = req.cookies['user_details'];
        if (userObj) {
            next();

        } else {
            res.redirect('/login');
        }
    };


    self.app.get('/', function (req, res) {
        var userObj = req.cookies['user_details'];
        if (userObj) {
            req.session.userObj = JSON.parse(userObj);

            res.redirect('/dashboard');

        } else {
            res.render('login.html', {layout: false});
        }
    });

    self.app.get('/login', function (req, res) {
        var userObj = req.cookies['user_details'];
        if (userObj) {
            req.session.userObj = JSON.parse(userObj);
            res.redirect('/dashboard');
        } else {
            res.render('login.html', {layout: false});
        }
    });



    self.app.get('/dashboard', roleCheck, function (req, res) {
        res.render('dashboard.html', {layout: '', userRole: req.session.role});
    });



    self.app.get('/404', roleCheck, function (req, res) {
        res.render('404.html', {layout: false, userRole: req.session.role});
    });

    self.app.get('/:key', function (req, res) {
        var userObj = req.cookies['user_details'];
        if (!userObj) {
            res.render('login.html', {layout: false});

        } else {
            res.redirect("/404");
        }

    });


};



