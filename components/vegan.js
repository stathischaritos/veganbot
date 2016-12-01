/**
*  @fileoverview API that helps you become a vegan.
*
*                How it should work
*                ------------------
*                I want to become a vegan
*                I want to stop eating meat
*                Can you help me become a vegetarian?
*                I want to go vegan
*
*  @author       Stathis Charitos
*
*/
// Facebook api to be added on init.
var api = null;
// Initialize question answering model
var natural = require('natural');
var tfidf = null;
var fs = require('fs');
// Module Nested Actions
var actions = {
  vegan: vegan,
  answer: answer
};
// -----------------------------------------------------------------------------
/** Initialize API.
* @method init
* @param {Object} fbAPI - Facebook api instance.
*/
// -----------------------------------------------------------------------------
function init (fbAPI) {
  // Attach FB api
  api = fbAPI;
  // Load tfidf model from file or create new model.
  fs.readFile('questions_tfidf.json', 'utf8', function (error, s) {
    if (error) console.log(error);
    if (s) {
      tfidf = new natural.TfIdf(JSON.parse(s));
    } else {
      tfidf = new natural.TfIdf();
    }
    console.log('tfidf questions model loaded...');
  });
}
// -----------------------------------------------------------------------------
/** Save the current tfidf model to disk.
* @method saveState
* @param {Object} fbAPI - Facebook api instance.
*/
// -----------------------------------------------------------------------------
function saveState (fbAPI) {
  if (tfidf) {
    var s = JSON.stringify(tfidf);
    fs.writeFile('questions_tfidf.json', s, function (error) {
      if (error) console.log(error);
      console.log('tfidf questions model saved!');
    });
  }
}
// -----------------------------------------------------------------------------
/** Choose what action to perform.
* @method resolve
* @param {Object} message - fb event object.
*/
// -----------------------------------------------------------------------------
function resolve (message) {
  api.markAsRead(message.threadID, function (err) {
    if (err) console.log(err);
  });
  // Check if you were asked a question.
  if (message.body.indexOf('?') !== -1) {
    actions.answer(message);
  } else {
    actions.vegan(message);
  }
}
// -----------------------------------------------------------------------------
/** Start down into path of becoming a vegan.
* @method vegan
* @param {Object} message - fb event object.
*/
// -----------------------------------------------------------------------------
function vegan (message) {
  api.sendMessage('Veganing is not possible at the moment.', message.threadID);
}
// -----------------------------------------------------------------------------
/** Answer a question.
* @method vegan
* @param {Object} message - fb event object.
*/
// -----------------------------------------------------------------------------
function answer (message) {
  // Are you vegan?
  if (message.body === 'are you vegan?') {
    api.sendMessage(
      'Well...I don`t eat anything, so technicaly YES.',
      message.threadID
    );
  } else {
    // TODO:: implement response retrieval method.
    // Add new question to model.
    if (tfidf) {
      // Add document to model.
      tfidf.addDocument(message.body);
      // Save updated model. Maybe dont do this on every question but on shutdown.
      saveState();
      // Get similar questions and respond.
      var results = [];
      tfidf.tfidfs(message.body, function (i, measure) {
        console.log('document #' + i + ' is ' + measure);
        results.push(i);
      });
      console.log(results);
      api.sendMessage(JSON.stringify(results), message.threadID);
    } else {
      api.sendMessage('...I can`t answer this question.', message.threadID);
    }
  }
}
/**
* Vegan API.
* @module Api/Vegan
*/
module.exports = {
  resolve: resolve,
  init: init
};
