var express = require('express');
var Pageres = require('pageres');
var path = require('path');
var fs = require('fs');
var md5 = require('md5');
var router = express.Router();
router.get('/', function(req, res, next) {
    var query = req.query;
    var screen_file_name = md5(query.url + query.size);
    var screen_file_path = path.join(__dirname, '../screens/');
    var sfn_arr = screen_file_name.split('');
    screen_file_path += [sfn_arr[1]+sfn_arr[3],sfn_arr[5]+sfn_arr[7]].join('/')+'/';
    var send_file_options = {
        root: screen_file_path,
        dotfiles: 'deny',
        headers: {
            'x-timestamp': Date.now(),
            'x-sent': true
        }
    };
    var lookfor_file = screen_file_path + screen_file_name + '.png';

    fs.exists(lookfor_file, function(exists) {
        console.info(exists);
        if (exists) {
            res.sendFile(screen_file_name + '.png', send_file_options, _next);
        } else {
            if(!query.url || !query.size){
                return res.send('required params url & size');
            }
            const pageres = new Pageres({
                    delay: 2,
                    scale:2
                })
                .src(decodeURIComponent(query.url), [query.size], {
                    crop: false,
                    filename: screen_file_name
                })
                .dest(screen_file_path)
                .run()
                .then(function() {
                    console.info('screenshot done!');
                    res.sendFile(screen_file_name + '.png', send_file_options, _next);
                });
        }

    });
    var _next = function(err) {
        if (err) {
            next(err);
        } else {
            console.log('Sent:', screen_file_name);
        }
    }

});

module.exports = router;
