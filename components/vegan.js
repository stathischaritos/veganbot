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
var questions = {};
var fs = require('fs');
var TOPN = 5;
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
  // Load old questions.
  fs.readFile('questions.json', 'utf8', function (error, s) {
    if (error) console.log(error);
    if (s) {
      try {
        questions = new natural.TfIdf(JSON.parse(s));
      } catch (e) {
        console.log('Unable to load question set!');
      }
    } else {
      questions = {};
    }
    console.log('Old questions loaded...');
  });
}
// -----------------------------------------------------------------------------
/** Save the current tfidf model to disk.
* @method saveState
* @param {Object} fbAPI - Facebook api instance.
*/
// -----------------------------------------------------------------------------
function saveState (fbAPI) {
  // Save tfidf model
  if (tfidf) {
    var sTfidf = JSON.stringify(tfidf);
    fs.writeFile('questions_tfidf.json', sTfidf, function (error) {
      if (error) console.log(error);
      console.log('tfidf questions model saved!');
    });
  }
  // Save original questions
  var sQuestions = JSON.stringify(questions);
  fs.writeFile('questions.json', sQuestions, function (error) {
    if (error) console.log(error);
    console.log('questions saved!');
  });
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
  if (message.body.indexOf('?') !== -1 || message.body.startsWith('train')) {
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
      var id = null;
      // Check if this is a training message and train model.
      if (message.body.startsWith('train')) {
        var parts = message.body.split(' ');
        id = parts[1];
        parts = parts.slice(2, parts.length);
        var response = parts.join(' ');
        if (questions[id]) questions[id].response = response;
      } else {
        // Add document to model.
        tfidf.addDocument(message.body);
        id = tfidf.documents.length - 1;
        questions[id] = { question: message.body };
        console.log(id);
        // Save updated model. Maybe dont do this on every question but on shutdown.
        // Get similar questions and respond.
        var results = [];
        tfidf.tfidfs(message.body, function (i, measure) {
          console.log('document #' + i + ' is ' + measure);
          results.push({ id: i, score: measure });
        });
        // Sort Results
        results.sort(function (a, b) {
          if (a.score > b.score) {
            return 0;
          } else {
            return 1;
          }
        });
        // Get top N results
        results = results.slice(0, TOPN);
        // Add text
        results.map(function (result) {
          result.text = this[result.id].question;
          result.response = this[result.id].response;
          return result;
        }, questions);
        // TODO::
        // Take these top N questions along with a context and retrieve a response.
        // The response should be inside one of these questions?
        // Respond
        api.sendMessage(JSON.stringify(results), message.threadID);
      }
      saveState();
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
