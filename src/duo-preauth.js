import { markers, credentials } from 'thousandeyes';
import assert from 'assert';
import { createHmac } from 'crypto';
import fetch from 'node-fetch';

executeTransation();

/**
 * Execute a Duo preauth transaction
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

    // No updates should be necessary below this point.
    const protocol = "https";
    const method = 'POST';
    const path = '/auth/v2/preauth';
    const body = `username=${userId}`;
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
    assert(
        response.ok,
        `HTTP Status code is not OK. ${response.status}: ${response.statusText}`
    );
    assert(responseJSON.stat == "OK", "API Response status is not OK");
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