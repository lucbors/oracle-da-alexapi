/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 * 
 * 
 * 
 * https://github.com/maverickjoy/alexa-webhook/blob/master/index.js
 */
const express = require('express');
const bodyParser = require('body-parser');
const webhookUtil = require("./utils/webhook/webhookUtil.js");
const _ = require("underscore");
const cache = require('./session-cache.js');



var metadata = {
    applicationID: "amzn1.ask.skill.31c034db-f400-4595-84cc-7ca04d540621", // Alexa skill Id needed to check if request is comming from my alexa skill
    channelSecretKey: '0HcUgpUdKbK5YhOfDSs7tu2vJFNSPTXk', //BOT Secret Key
    channelUrl: 'https://AMCeDevApistraatbmxp-cxxapistraat.mobile.ocp.oraclecloud.com:443/connectors/v1/tenants/idcs-03452a1374c94efd8c20b634b78e3fd4/listeners/webhook/channels/1EB458A9-366C-4242-BFFD-FEADB8374163'
};


function init(config) {

    var app = express();
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(bodyParser.json());

    var logger = (config ? config.logger : null);
    if (!logger) {
        const log4js = require('log4js');
        logger = log4js.getLogger();
        logger.setLevel('INFO');
        log4js.replaceConsole(logger);
        logger.info("running");
    }

    var alexaRes;
    app.post('/alexa', function (req, res) {


        logger.info('request arrived. Type= ' + req.body.request.type);
        var sessionId = req.body.session.sessionId;
        var msg = '';

        cache.insertSession(sessionId, res);


        if (req.body.request.type === 'IntentRequest') {
            if(req.body.request.intent.name){
                   logger.info('request arrived. Name= ' + req.body.request.intent.name);
                  }
        }


        // --> Launch Request
        if (req.body.request.type === 'LaunchRequest') {
            res.json({
                "version": "1.0",
                "response": {
                    "shouldEndSession": false,
                    "outputSpeech": {
                        "type": "SSML",
                        "ssml": "<speak>Hi <break time=\"1s\"/> what can I do for you? </speak>"
                    }
                }
            })
        } else if (req.body.request.type === 'SessionEndedRequest') {
        } else if (req.body.request.type === 'IntentRequest' &&
                req.body.request.intent.name === 'SaySomething') {
            logger.info('here we can call the bot  :');


            if (req.body.request.intent.slots){
                command = req.body.request.intent.slots.sentence.value;
                //command = getSlotValues(req.body.request.intent.slots) || '';
        }


        console.log('Received: ', command);


        if (metadata.channelUrl && metadata.channelSecretKey && sessionId && command) {
            var additionalProperties = {};
            webhookUtil.messageToBotWithProperties(metadata.channelUrl, metadata.channelSecretKey, sessionId, command, additionalProperties, function (err) {
                if (err) {
                    logger.info("Failed sending message to Bot");
                    msg = "Failed sending message to Bot.  Please review your bot configuration.";
                    res.set('Content-Type', 'text/xml');
                    res.send(msg);
                } else {
                    console.log("msg to bot sent. Now in succes of alexa post");
                    // res.set('Content-Type', 'text/xml');
                    // res.send(msg);
                    alexaRes = res;
                }
            });
        } else {
            _.defer(function () {
                msg = "I don't understand. Could you please repeat what you want?";
                res.set('Content-Type', 'text/xml');
                res.send(msg);
            });
        }
    }
    });


    function getSlotValues(slots) {
        if (!slots)
            return '';
        return Object.keys(slots).map(key => slots[key].value || '').join(' ');
    }
    ;

    function convertRespToSpeech(resp) {
        console.log(resp);
        var sentence = "";
        if (resp.text) {
            sentence = resp.text;
        }
        if (resp.choices) {
            if (resp.choices.length > 0) {
                sentence += '  The following are your choices: ';
                sentence += resp.choices.join(', ') + '. ';
            }
        }
        if (resp.attachment) {
            sentence += "An attachment of type " + resp.attachment.type + " is returned.";
        }
        return sentence;
    }

    function sendMessage(res, sessionId, message) {
        console.log("1");
        
        var responseCallback = cache.popSessionResponse(sessionId);
        alexaRes.json({
            "version": "1.0",
            "response": {
                "shouldEndSession": false,
                "outputSpeech": {
                    "type": "SSML",
                    "ssml": "<speak>" + message + "</speak>"
                }
            }
        });
        console.log("2");

        if (responseCallback) {
            console.log("3");

            responseCallback.send(alexaRes);
            console.log("Message Sent to Alexa !");
            res.sendStatus(200);
        } else {
            console.log("Error No response callback");
            res.sendStatus(404);
        }




    }


    // here is where our bot sends its replies to
    app.post('/webhook', bodyParser.json(), function (req, res) {
        logger.info("ReqBody Message from webhook channel", req.body);

        const sessionId = req.body.userId;
        if (!sessionId) {
            return res.status(400).send('Missing sessionId ');
        }
        if (webhookUtil.verifyMessageFromBot(req.get('X-Hub-Signature'), req.body, metadata.channelSecretKey)) {
            res.sendStatus(200);
            var msgTxt = convertRespToSpeech(req.body);
            logger.info("message Text:", msgTxt);
            logger.info("from bot req.body:", req.body);
            sendMessage(res, sessionId, msgTxt);
        } else {
            res.sendStatus(403);
        }
    });

    app.locals.endpoints = [];
    app.locals.endpoints.push({
        name: 'webhook',
        method: 'POST',
        endpoint: '/webhook'
    });


    app.locals.endpoints.push({
        name: 'alexa',
        method: 'POST',
        endpoint: '/alexa'
    });







    return app;
}

module.exports = {
    init: init
};