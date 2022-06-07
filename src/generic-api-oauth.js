import { markers, credentials} from 'thousandeyes';
import assert from 'assert';
import fetch from 'node-fetch';


// This configuration object should drive the configuration of this transaction.
// The url, method, headers, and body fields set the request to make.
// The auth object controls the authentication details
// The validation object controls validation of the request
const configuration = {
    'url':' https://myapp.domain.tld',
    'method': 'POST',
    'headers': { 'Content-Type': 'application/json' },
    'body': JSON.stringify({
        "jason":"content",
    }),
    'auth': {
        'url': 'https://oauth.provider.tld/token',
        'username': 'myUser',
        'credential': 'myCredentialName',
        'method': 'POST'
    },
    'validation': {
        "statusCode": "200-299,302",
        "content": /^SUCCESS/
    },
};

execute();

/**
 * Execute the transaction, first authenticating and generating an OAuth token,
 * then using this token, send the API request, and finally validate the 
 * response.
 */
async function execute() {

    // This transaction uses the client_credentials grant type.  You can modify
    // this section to use a different grant type if necessary.
    const url = configuration.auth.url;
    const body = 'grant_type=client_credentials'+
                 '&client_id='+encodeURIComponent(configuration.auth.username)+
                 '&client_secret='+encodeURIComponent(credentials.get(configuration.auth.credential));

    const request = {
        method: configuration.auth.method,
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
    await transaction(responseJSON.access_token);
}

/**
 * Using the authentication token, execute the API transaction
 */

async function transaction(tokenData){

    if (! ('headers' in configuration)){
        configuration.headers = {}
    }
    configuration.headers['Authorization'] = 'Bearer '+tokenData;

    const requestBody = {
        method: configuration.method,
        body:    configuration.body,
        headers: configuration.headers
    };

    markers.start('HTTP-Transaction');
    const response = await fetch(configuration.url, requestBody);
    const responseText = await response.text();
    markers.stop('HTTP-Transaction');

    if ('validation' in configuration){
        validateRequest(response, responseText, configuration.validation);
    }
}

/**
 * Validate the response
 */
function validateRequest(response, responseText, toValidate) {

    if ('statusCode' in toValidate){
        const status = parseInt(response.status)

        if (toValidate.statusCode === true){
            assert((status >= 200 && status < 400),
                "HTTP Status Code NOT OK.");

        } else if (toValidate.statusCode){
            const ports = toValidate.statusCode.split(',');
            assert(ports.some((port) => {
                const parts = port.split("-");
                if (parts.length == 1){
                    return (parseInt(port) == status);
                } else if (parts.length == 2){
                    return (parseInt(parts[0]) <= status &&
                                parseInt(parts[1]) >= status)
                }
                return false
            }), `HTTP status code '${response.status}' does not match valid options: ${toValidate.statusCode}`);
        }
    }
    if ('content' in toValidate){
        if (toValidate.content instanceof RegExp){
            assert(toValidate.content.test(responseText),
                "Response did not match regular expression: "+toValidate.content)
        } else {
            assert(responseText.includes(toValidate.content),
                "Response did not contain: "+toValidate.content);
        }
    }
}