const express = require('express');
const bodyParser = require('body-parser');
const webhookUtil = require('../bots-js-utils/webhook/webhookUtil.js');

const Alexa = require('ask-sdk-core');


const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    const speechText = 'Welcome to the Alexa Skills Kit, you can say hello!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('Hello World', speechText)
      .getResponse();
  }
};

exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    LaunchRequestHandler
//    HelloWorldIntentHandler,
//    HelpIntentHandler,
//    CancelAndStopIntentHandler,
//    SessionEndedRequestHandler)
  )
//  .addErrorHandlers(ErrorHandler)
  .lambda();





var bigInt = require("big-integer");
//var config = require('./config.js');

var params = '';
var reply_to_tweet_id_str = '';




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

    var metadata = {
        applicationID: "amzn1.ask.skill.31c034db-f400-4595-84cc-7ca04d540621", // Alexa skill Id needed to check if request is comming from my alexa skill
        channelSecretKey: '0HcUgpUdKbK5YhOfDSs7tu2vJFNSPTXk', //BOT Secret Key
        channelUrl: 'https://AMCeDevApistraatbmxp-cxxapistraat.mobile.ocp.oraclecloud.com:443/connectors/v1/tenants/idcs-03452a1374c94efd8c20b634b78e3fd4/listeners/webhook/channels/1EB458A9-366C-4242-BFFD-FEADB8374163'
    };



    function convertRespToSpeech(resp) {
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
            sentence += "An attachment of type " + resp.attachment.type + " is returned."
        }
        return sentence;
    }

    function sendMessage(userId, message) {
      client.sendMessage({
        to:userId, // The user's phone number
        from: metadata.myTwilioNumber, // A number bought from Twilio and can use for outbound communication
        body: message // body of the SMS message
      }, function(err, responseData) { //this function is executed when a response is received from Twilio
        if (!err) { // "err" is an error received during the request, if any

      // "responseData" is a JavaScript object containing data received from Twilio.
      // A sample response from sending an SMS message is here (click "JSON" to see how the data appears in JavaScript):
      // http://www.twilio.com/docs/api/rest/sending-sms#example-1

          logger.info(responseData.from); // outputs "+14506667788"
          logger.info(responseData.body); // outputs "word to your mother."

        } else {
          logger.info(err);
        }
      });
    }


    // here is where our bot sends its replies to
    app.post('/webhook', bodyParser.json(), function (req, res) {
        logger.info("Message from webhook channel", req.body);
        const userID = req.body.userId;
        if (!userID) {
            return res.status(400).send('Missing User ID');
        }
        if (webhookUtil.verifyMessageFromBot(req.get('X-Hub-Signature'), req.body, metadata.channelSecretKey)) {
            res.sendStatus(200);
            var msgTxt = convertRespToSpeech(req.body);
            logger.info("message Text:", msgTxt);
            logger.info("req.body:", req.body);
            sendMessage(userID, msgTxt);
        } else {
            res.sendStatus(403);
        }
    });

    app.post('/alexa', function(req, res) {
        var sessionId = req.body.session.sessionId;
        var alexaApplicationId = req.body.session.application.applicationId;
        var alexaRequest = req.body.session.application.applicationId;
        var alexaRequestType = req.body.request.type;

        //
        //var alexaRequest = 'get me some pizza please';
        //var alexaAppId = req.session.application.applicationId;
        //logger.info(alexaAppId);
        logger.info(sessionId);
        logger.info('requestType :' + alexaRequestType);


// NOTE LUC: We can use Alexa sessionId to uniquely identify where we should reply to, so this is what we will use as userId to forward to AMCe
        logger.info("alexaApplicationId " + alexaApplicationId);
        //logger.info(JSON.stringify(req.body));
        var msg ='';
        //var twiml = new twilio.TwimlResponse();
        var command = alexaRequest;
       
        
        
        
        
        
        
        const speechText = 'Welcome to the Alexa Skills Kit, you can say hello!';

    return req.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('Hello World', speechText)
      .getResponse();
  
        
        
        
        
        
        
        
        
        
//            if (metadata.channelUrl && metadata.channelSecretKey && sessionId && command) {
//                var additionalProperties = {};
//              webhookUtil.messageToBotWithProperties(metadata.channelUrl, metadata.channelSecretKey, sessionId, command, additionalProperties, function(err) {
//                    if (err) {
//                        logger.info("Failed sending message to Bot");
//                        msg =  "Failed sending message to Bot.  Please review your bot configuration.";
//                        res.set('Content-Type', 'text/xml');
//                        res.send(msg);
//                    } else {
//                      res.set('Content-Type', 'text/xml');
//                      res.send(msg);
//                    }
//                });
//            } else {
//                _.defer(function() {
//                    msg = "I don't understand. Could you please repeat what you want?";
//                    res.set('Content-Type', 'text/xml');
//                    res.send(msg);
//                });
//            }
            return false;
        }
    );
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
