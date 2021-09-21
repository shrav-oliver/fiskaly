var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    res.render('index', { 
        authCredentialsRes: '',
        createTSSRes: '',
        api_key: '',
        api_secret: '',
        status_code: 500,
        tssList: []
    });
});


module.exports = router;
