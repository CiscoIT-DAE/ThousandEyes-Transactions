import { markers, credentials } from 'thousandeyes';
import assert from 'assert';
import { createHmac } from 'crypto';
import fetch from 'node-fetch';

executeTransation();

/**
 * Execute a Duo auth transaction
 */
async function executeTransation() {
   
    // These variables must be set for your individual use case

    // The Duo documentation details the integration key, secret key and API 
    // hostname here: https://duo.com/docs/authapi
    const integrationKey = credentials.get('integrationKey');
    const secretKey = credentials.get('secretKey');
    const host = 'api-hostname.duosecurity.com';
    // The user being authenticated in this transaction
    const userId = 'authUser';
    // This transaction requires use of a bypass code for the user
    // authentication. Generation and use of a bypass code for this transaction
    // creates a way to bypass the 2 factor authentication in Duo, as it  
    // is difficult to implement in an automated transaction.  The existance of
    // a bypass code creates a certain risk for the user account in question, 
    // and you should understand and accept these risk before generating the
    // bypass code. Duo documentation for bypass codes can be found here: 
    // https://duo.com/docs/administration-users#generating-a-bypass-code
    const passcode = credentials.get('bypassCode');

    // No updates should be necessary below this point.
    const protocol = "https";
    const method = 'POST';
    const path = '/auth/v2/auth';
    const body = `factor=passcode&passcode=${passcode}&username=${userId}`;
    const url = `${protocol}://${host}${path}`;
    const dateString = getRFC2822Date();

    // This payload and the resulting signature must be constructed exactly as
    // shown below. Duo will reconstruct the payload and signature with these
    // details from the request and verify the hash you provide matches the
    // hash they generate.
    const payload2Hash = [dateString, method, host, path, body].join("\n");
    const hash = createHmac('sha1', secretKey)
                 .update(payload2Hash)
                 .digest('hex');

    const request = {
        method,
        body,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${to64(`${integrationKey}:${hash}`)}`,
            'Date': dateString,
        }
    };

    markers.start('API-Transaction');
    const response = await fetch(url, request);
    const responseJSON = await response.json();
    markers.stop('API-Transaction');
    assert(response.ok,
        `HTTP Status code is not OK. ${response.status}: ${response.statusText}`)
    assert(responseJSON.stat == "OK", "API Response Status is not OK")
    assert(responseJSON.response.result == "allow",
        `response.result is not 'allow': ${responseJSON.response.result}`)
    assert(responseJSON.response.status == "allow",
        `response.status is not 'allow': ${responseJSON.response.status}`)
}

/**
 * Generate a Datetime string meeting RFC2822 format requirements
 * @return {String} - Datetime string
 */
 function getRFC2822Date() {
    return new Date().toUTCString().replace(/GMT/g, '+0000');
}

/**
 * Encode a string to Base64 format
 * @param {String} data - A string to be encoded
 * @return {String} - A base64 encoded version of the data parameter
 */
function to64(data) {
    return Buffer.from(data).toString('base64');
}