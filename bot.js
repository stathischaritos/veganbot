/**
*  @fileoverview Bot API. General bot initialisation and actions.
*
*  @author       Stathis Charitos
*
*  @requires     NPM:facebook-chat-api
*  @requires     ../config/facebook
*  @requires     ./chat
*  @requires     ./jukebox
*  @requires     ./printer
*  @requires     ./social
*/
var facebookConfig = require('./config/facebook');
var login = require('facebook-chat-api');
var vegan = require('./components/vegan');
const MAXIMUM = 10000;
const MINIMUM = 3000;
// -----------------------------------------------------------------------------
/** Initialize FB event listener.
* @method start
* @param {Function} callback - Call when ready.
*/
// -----------------------------------------------------------------------------
function start (callback) {
  login({
    email: facebookConfig.username,
    password: facebookConfig.password
  }, function callback (error, api) {
    if (error) return console.error(error);
    vegan.init(api);
    console.log('Facebook API ready...');
    api.listen(processEvent);
  });
}
// -----------------------------------------------------------------------------
/** Process FB api event.
* @method processEvent
* @param {Object} error - Error.
* @param {Object} message - fb event object.
*/
// -----------------------------------------------------------------------------
function processEvent (error, message) {
  if (error) console.log(error);
  resolveMessage(message);
}
// -----------------------------------------------------------------------------
/** Check if bot is being called and figure out what action take.
* @method resolveMessage
* @param {Object} message - fb event object.
*/
// -----------------------------------------------------------------------------
function resolveMessage (message) {
  var wait = Math.floor(Math.random() * (MAXIMUM - MINIMUM + 1)) + MINIMUM;
  setTimeout(function () {
    vegan.resolve(message);
  }, wait);
}
/**
* Bot module.
* @module Api/Bot
*/
module.exports = {
  start: start
};
