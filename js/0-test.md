TODO: A good way of testing 2 would be to just use renderErrorPage in a function that always runs.

Testing checkForValidSession-rewrite
====================================

What's been changed?
--------------------

Changes listed from least likely to break to mostly likely.

1. Created sendUserToLoginPage.js.
2. Created renderErrorPage.js.
3. Created ensureValidSession.js.

What needs to be tested?
------------------------

1. Make sure sendUserToLoginPage.js is working.
  - [X] Make sure it's working in at least one instance.
  - [ ] Make sure the function calls and parameters in the other instances look correct.
2. Make sure renderErrorPage is working.
  - Make sure it's working in at least one instance.
  - Make sure the function calls and parameters in the other instances look correct.
3. Test each function in ensureValidSession.js.

Instances of sendUserToLoginPage Not in routeHandlers.js
--------------------------------------------------------

Add an 'X' to each checkbox when you're sure each instance is working correctly.

- [X] ensureValidSession.js:12:    const sendUserToLoginPage = require( './sendUserToLoginPage' );
- [ ] ensureValidSession.js:50:    sendUserToLoginPage( response, request.get( 'host' ), request.url );
- [ ] ensureValidSession.js:135:   sendUserToLoginPage( response, request.get( 'host' ), request.url );
- [X] sendusertologinpage.js:9:    function sendusertologinpage( response, host, loginpageurl ) {
- [X] sendusertologinpage.js:17:   module.exports = sendusertologinpage;

Instances of sendUserToLoginPage in routeHandlers.js
----------------------------------------------------

Add an 'X' to each checkbox when you're sure each instance is working correctly.

- [X] routehandlers.js:43:         function sendusertologinpage( response, host, destinationurl ) {
- [X] routehandlers.js:102:        sendusertologinpage( response, request.get( 'host' ), request.url );
- [X] routehandlers.js:183:        sendusertologinpage( response, request.get( 'host' ), request.url );

Instances of renderErrorPage Not in routeHandlers.js
----------------------------------------------------

Add an 'X' to each checkbox when you're sure each instance is working correctly.

- [ ] ensureValidSession.js:11:  const renderErrorPage = require( './renderErrorPage' );
- [ ] ensureValidSession.js:77:  renderErrorPage( response, message, '' );
- [ ] ensureValidSession.js:87:  renderErrorPage( response, message, errorDetails );
- [ ] renderErrorPage.js:9:      function renderErrorPage( response, message, errorDetails ) {
- [ ] renderErrorPage.js:18:     module.exports = renderErrorPage;

Instances of renderErrorPage in routeHandlers.js
------------------------------------------------

Add an 'X' to each checkbox when you're sure each instance is working correctly.

- [X] routeHandlers.js:29:       const renderErrorPage = require( './renderErrorPage' );
- [ ] routeHandlers.js:110:      renderErrorPage( response,
- [ ] routeHandlers.js:161:      renderErrorPage( response, 'You must be a trusted translator to use the PhET translation utility. ' +
- [ ] routeHandlers.js:193:      renderErrorPage( response, `Unable to obtain user credentials. Error: ${error}.` );
- [ ] routeHandlers.js:284:      renderErrorPage( response, `Unable to retrieve string keys from ${simUrl}.`, '' );
- [ ] routeHandlers.js:596:      .catch( error => renderErrorPage( response, 'Error testing translation...', error ) );
- [ ] routeHandlers.js:736:      renderErrorPage( response, message, errorDetails );
- [ ] routeHandlers.js:743:      renderErrorPage( response, message, errorDetails );
- [ ] routeHandlers.js:757:      renderErrorPage( response, message, errorDetails );
- [ ] routeHandlers.js:764:      renderErrorPage( response, message, errorDetails );
- [ ] routeHandlers.js:784:      renderErrorPage( response, message, errorDetails );
- [ ] routeHandlers.js:825:      renderErrorPage( response, message, errorDetails );
- [ ] routeHandlers.js:832:      renderErrorPage( response, message, errorDetails );
- [ ] routeHandlers.js:854:      renderErrorPage( response, message, errorDetails );

Functions in ensureValidSession
-------------------------------

1. bypassSessionValidation  (helper function)
2. getUserData              (helper function)
3. sessionShouldBeCreated   (helper function)
4. isTranslatorOrTeamMember (helper function) 
5. createSession            (helper function)
6. denyAccess               (helper function)
7. handleStaleSessionCookie (helper function)
8. ensureValidSession       (replacement for checkForValidSession in routeHandlers.js)

Instances of bypassValidSession
-------------------------------

Add an 'X' to each checkbox when you're sure each instance is working correctly.

- [ ] ensureValidSession.js:15:     function bypassSessionValidation( request, next ) {
- [ ] ensureValidSession.js:113:    bypassSessionValidation( response, next );

Instances of getUserData
------------------------

Add an 'X' to each checkbox when you're sure each instance is working correctly.

- [ ] ensureValidSession.js:32:  async function getUserData( request, loginCookie ) {
- [ ] ensureValidSession.js:43:  const userData = await getUserData( request, loginCookie );
- [ ] ensureValidSession.js:63:  const userData = getUserData( request, loginCookie );

Instances of sessionShouldBeCreated
-----------------------------------

Add an 'X' to each checkbox when you're sure each instance is working correctly.

- [ ] ensureValidSession.js:42:         async function sessionShouldBeCreated( request, response, loginCookie ) {
- [ ] ensureValidSession.js:122:        if( await sessionShouldBeCreated( request, response, loginCookie) ) {

Instances of isTranslatorOrTeamMember
-------------------------------------

Add an 'X' to each checkbox when you're sure each instance is working correctly.

- [ ] ensureValidSession.js:45:    if( isTranslatorOrTeamMember( request, response, userData) ) {
- [ ] ensureValidSession.js:55:    function isTranslatorOrTeamMember( response, userData ) {

Instances of createSession
--------------------------

Add an 'X' to each checkbox when you're sure each instance is working correctly.

- [ ] ensureValidSession.js:62:           function createSession( request, loginCookie ) {
- [ ] ensureValidSession.js:123:          createSession( request, loginCookie );

Instances of denyAccess
-----------------------

Add an 'X' to each checkbox when you're sure each instance is working correctly.

- [ ] ensureValidSession.js:74:           function denyAccess( response ) {
- [ ] ensureValidSession.js:126:          denyAccess( response );

Instances of handleStaleSessionCookie
-------------------------------------

Add an 'X' to each checkbox when you're sure each instance is working correctly.

- [ ] ensureValidSession.js:80:       function handleStaleSessionCookie( request, response ) {
- [ ] ensureValidSession.js:131:      handleStaleSessionCookie( request, response );

Instances of ensureValidSession
-------------------------------

Add an 'X' to each checkbox when you're sure each instance is working correctly.

- [ ] ensureValidSession.js:74:           function denyAccess( response ) {
- [ ] ensureValidSession.js:126:          denyAccess( response );
- [ ] ensureValidSession call in routeHandlers.js
