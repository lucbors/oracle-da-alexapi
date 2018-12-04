const crypto = require('crypto');
const request = require('request');
const _ = require('underscore');

function verifyMessageFromBot(signature, msgBody, secretKey) {
    if (!signature) {
        console.log('Missing signature');
        return false;
    }
    const body = Buffer.from(JSON.stringify(msgBody), 'utf8');
    const calculatedSig = buildSignatureHeader(body, secretKey);
    if (signature !== calculatedSig) {
        console.log('Invalid signature:', signature);
        console.log('Body: \n"%s"', body);
        console.log('Calculated sig: %s', calculatedSig);
        return false;
    }
    console.log('Valid signature: %s', signature);
    return true;
}

/*
 'buf' is a Buffer
 'secret' is a String
 */
function buildSignatureHeader(buf, secret) {
    var msg_signature = buildSignature(buf, secret);
    return msg_signature;
}

function buildSignature(buf, secret) {
    const hmac = crypto.createHmac('sha256', Buffer.from(secret, 'utf8'));
    hmac.update(buf);
    var msg_hmac_digest = "sha256=" + hmac.digest('hex');
    console.log("HMAC Signature generated: " + msg_hmac_digest);
    return msg_hmac_digest;
}

function messageToBot(channelUrl, channelSecretKey, userId, inMsg, callback) {
  messageToBotWithProperties(channelUrl, channelSecretKey, userId, inMsg, null, callback);
}

/*
  Use this function to pass additional properties to bots.
  A common use case is to add a userProfile property.  Pass additionalProperties as follows:
  {
    "userProfile": {
      "firstName": <first name>,
      "lastName": <last name>,
      "age": <age>
    }
  }
*/
function messageToBotWithProperties(channelUrl, channelSecretKey, userId, inMsg, additionalProperties, callback) {
    var outMsg = {userId:userId,text:inMsg};
    if (additionalProperties){
      _.extend(outMsg, additionalProperties);
    }
    
    const body = Buffer.from(JSON.stringify(outMsg), 'utf8');
    console.log("Message to Bot:" + body);

    const headers = {};
    headers['Content-Type'] = 'application/json; charset=utf-8';
    headers['X-Hub-Signature'] = buildSignatureHeader(body, channelSecretKey);

    request.post({
        uri: channelUrl,
        headers: headers,
        body: body,
        timeout: 60000,
        followAllRedirects: true,
        followOriginalHttpMethod: true,
        callback: function(err, response, body) {
            if (!err) {
                //console.log(response);
                callback(null);
            } else {
                console.log(response);
                console.log(body);
                console.log(err);
                callback(err);
            }
        }
    });
}

module.exports = {
    messageToBot: messageToBot,
    messageToBotWithProperties: messageToBotWithProperties,
    verifyMessageFromBot: verifyMessageFromBot
}
