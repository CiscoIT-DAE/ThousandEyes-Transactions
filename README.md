# ThousandEyes-Transactions
A collection of script examples to be used with ThousandEyes Web Transaction tests

---

## Duo auth & preauth Transactions

Executing transactions against the Duo API can provide key insights into the authentication
experience of your users, allowing you to proactively detect issues, and quickly verify user reports.

### preauth vs auth
The Duo preauth transaction determines whether a user is authorized to log in, and (if so) returns 
the user's available authentication factors.  This transaction exercises various components of the 
Duo Auth API without requiring a user bypass code.

The Duo auth transaction actually completes an authentication transaction, verifying more of the Duo
subsystems than the preauth transaction, but it requires the use of a bypass code.

### Prequisites
In order to setup this transaction you should follow the "First Steps" section of the
[Duo Auth API documentation](https://duo.com/docs/authapi#first-steps). You must identify the
following details:
* Integration key
* Secret key
* API hostname
* A user to execute the preauth request for.
* A bypass code (auth transaction ONLY)

### Configuring the transaction
* Within ThousandEyes, register the secret key, integration key, and bypass code (if using the auth) as separate secrets in the `Credential Repository`.
* Create a new Web Transaction test.
* Use the [Duo Auth API /ping endpoint](https://duo.com/docs/authapi#/ping) endpoint for your API hostname as the URL.
* Paste the code snippet from this repo in the `Transaction Script` field.
* Update the code with your API hostname, username, the name of the integration key, secret key, and bypass code (if auth) credentials.
* Using the key icon above the transaction script window, grant this test access to the relevant credentials.
* Set the remaining test attributes, then `Save` or verify with `Run Once`

> The ThousandEyes Recorder IDE can also be used to test these transaction locally on your desktop

### Resources
* [Duo Auth API documentation](https://duo.com/docs/authapi#/preauth) - Relevant sections: "First Steps", "Endpoints > /preauth", and "Endpoints > /auth"
* [Duo Bypass Code documentation](https://duo.com/docs/administration-users#generating-a-bypass-code)

---

## Generic OAuth Transaction

ThousandEyes HTTP Server Tests are fairly flexible in the ways that you can configure the
transaction, but there are some limitations to the test type.  You may want to use a different
HTTP method, have a dynamic payload, or specify a nuanced validation criteria.  While the HTTP
Server test type cannot support this, the Web Transaction test type can!

This example implements a client_credentials grant type OAuth authentication, followed by an API
request using the resulting auth token.  It enables easy configuration of both the Authentication
stage as well as the API request, and provides both HTTP status code and regex based validation.

### Prerequisites
You should identify the configuration details of both the authentication and API transaction.  As
the Web Transaction test also contains an HTTP Server view component, you should also identify an
appropriate URL for the HTTP Server configuration.  The best option would be a basic 'ping' or
health API that functions without authentication and a GET http method.

### Configuring the transaction
* Within ThousandEyes, register the client secret in the `Credential Repository`.
* Create a new Web Transaction test.
* Configure the basic parameters of the test: interval, agents, url.
* Paste the code snippet from this repo in the `Transaction Script` field.
* Update the configuration and auth objects with the configuration details you previously identified.
    * If no validation is required, remove this key from the configuration object
* Using the key icon above the transaction script window, grant this test access to the relevant credentials.
* Set the remaining test attributes, then `Save` or verify with `Run Once`

> The ThousandEyes Recorder IDE can also be used to test these transaction locally on your desktop