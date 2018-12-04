"use strict";

var app = require('./app_alt.js');

//set parameters as appropriate
var PORT = process.env.PORT || 3000;

const config = {
    root: __dirname,
    port: PORT,
    logLevel: 'INFO',
    logger: null,
    basicAuth: null,
    sslOptions: null
};

// Create an express app instance
var express_app = app.init(config);

// Start the server listening..
express_app.listen(PORT);