# ThousandEyes-Transactions
A collection of script examples to be used with ThousandEyes Web Transaction tests

---
## Duo auth & preauth Transactions

### preauth vs auth
The Duo preauth transaction determines whether a user is authorized to log in,
and (if so) returns the user's available authentication factors.  This
transaction exercises various components of the Duo Auth API without requiring
a user bypass code.

The Duo auth transaction actually completes an authentication transaction,
verifying more of the Duo subsystems than the preauth transaction, but it
requires the use of a bypass code.

### Prequisites
In order to setup this transaction you should follow the "First Steps" section
of the [Duo auth API documentation](https://duo.com/docs/authapi#first-steps).
You must identify the following details:
* Integration key
* Secret key
* API hostname
* A user to execute the preauth request for.

### Configuring the transaction
* Within ThousandEyes, register the secret key and integration key as separate secrets in the `Credential Repository`.
* Create a new Web Transaction test.
* Use the [ping API](https://duo.com/docs/authapi#/ping) endpoint for your API hostname as the URL.
* Paste the code snippet from this repo in the `Transaction Script` field.
* Update the code with your API hostname, the username, the name of the integration key credential, and the name of the secret key credential.
* Using the key icon above the transaction script window, grant this test access to both of the relevant credentials.
* Set the remaining test attributes, then `Save` or verify with `Run Once`

### Resources
* [Duo preauth API documentation](https://duo.com/docs/authapi#/preauth)
* [Duo auth API documentation](https://duo.com/docs/authapi#/auth)
* [Duo bypass code documentation](https://duo.com/docs/administration-users#generating-a-bypass-code)