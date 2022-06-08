import { markers, credentials} from 'thousandeyes';
import assert from 'assert';
import fetch from 'node-fetch';

/**
 * The configuration object defines the transaction to execute and how to validate the response
 * 
 * @param {String} url - The target URL of the transaction
 * @param {String} method - The HTTP method
 * @param {Object} headers - The headers represented as key/value pairs
 * @param {String} body - The body of the request
 * @param {String} marker - The TE marker name for measuring the transaction
 * @param {String|Boolean} validation.statusCode - A comma separated list of ports or port ranges 
 *                                                 considered valid, or Boolean true to use 200-399
 * @param {String|RegExp} validation.content - A string or RegExp that must match the content of the reponse
 */
const configuration = {
    'url': 'https://myapp.domain.tld',
    'method': 'POST',
    'headers': { 'Content-Type': 'application/json' },
    'body': JSON.stringify({
        "jason":"content",
    }),
    'marker': 'HTTP-Transaction',
    'validation': {
        "statusCode": "200-299,302",
        "content": /^SUCCESS/
    },
};

/**
 * This object drives the details of the authentication process.
 * @param {String} url - The OAuth url
 * @param {String} username - The username for authentication
 * @param {String} credentialName - The ThousandEyes credential name containing the password for authentication
 * @param {String} method - The HTTP method
 */
const auth = {
    'url': 'https://oauth.provider.tld/token',
    'username': 'myUser',
    'credentialName': 'myCredentialName',
    'method': 'POST'
};

execute();

/**
 * Execute the transaction, first authenticating and generating an OAuth token, then using this
 * token, send the API request
 */
async function execute() {
    const token = await authenticate(auth);
    await executeRequest(configuration, token);
}

/**
 * OAuth Authentication using client_credentials
 * @param {Object.String} auth.url - The OAuth url
 * @param {Object.String} auth.username - The username for authentication
 * @param {Object.String} auth.credentialName - The ThousandEyes credential name containing the
 *                                              password for authentication
 * @param {Object.String} auth.method - The HTTP method
 * @returns {String} - The generated OAuth token
 */
async function authenticate({url, username, credentialName, method}) {
    /* 
    * This transaction uses the client_credentials grant type.  You can modify this section to use 
    * a different grant type if necessary.
    */
    const body = 'grant_type=client_credentials'+
                 '&client_id='+encodeURIComponent(username)+
                 '&client_secret='+encodeURIComponent(credentials.get(credentialName));

    const request = {
        method,
        body,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        }
    };

    markers.start('OAuth');
    const response = await fetch(url, request);
    const responseJSON = await response.json();
    markers.stop('OAuth');

    assert('access_token' in responseJSON, "No Oauth Token");
    return responseJSON.access_token;
}

/**
 * Using the authentication token, execute the API transaction
 * @param {String} config.url - The target URL of the transaction
 * @param {String} config.method - The HTTP method
 * @param {Object} config.headers - The headers represented as key/value pairs
 * @param {String} config.body - The body of the request
 * @param {String} config.marker - The TE marker name for measuring the transaction
 * @param {String} config.validation.statusCode - A comma separated list of ports or port ranges
 *                                                considered valid
 * @param {String|RegExp} config.validation.content - A string or RegExp that must match the content
 *                                                    of the reponse
 */

async function executeRequest({ headers, method, body, url, marker, validation }, token) {

    if (token) {
        if (! (headers instanceof Object)) {
            headers = {}
        }
        headers.Authorization = 'Bearer '+token;
    }

    markers.start(marker);
    const response = await fetch(url, { method, body, headers });
    const responseText = await response.text();
    markers.stop(marker);

    if (validation) {
        validateRequest(response, responseText, validation);
    }
}

/**
 * Validate the response
 * @param {Object} response - The fetch response object
 * @param {String} responseText - The response formatted as a string
 * @param {String|Boolean} validation.statusCode - A comma separated list of ports or port ranges 
 *                                                 considered valid, or Boolean true to use 200-399
 * @param {String|RegExp} validation.content - A string or RegExp that must match the content of the reponse
 */
function validateRequest(response, responseText, {statusCode, content}) {
    if (statusCode) {
        const status = parseInt(response.status)

        if (statusCode === true) {
            assert((status >= 200 && status < 400),
                "HTTP Status Code NOT OK.");

        } else {
            const ports = statusCode.split(',');
            assert(ports.some((port) => {
                const parts = port.split("-");
                if (parts.length == 1) {
                    return (parseInt(port) == status);
                } else if (parts.length == 2) {
                    return (parseInt(parts[0]) <= status &&
                                parseInt(parts[1]) >= status)
                }
                return false
            }), `HTTP status code '${response.status}' does not match valid options: ${statusCode}`);
        }
    }

    if (content) {
        if (content instanceof RegExp){
            assert(content.test(responseText),
                "Response did not match regular expression: "+content)
        } else {
            assert(responseText.includes(content),
                "Response did not contain: "+content);
        }
    }
}