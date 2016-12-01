var threadId = process.env.THREAD_ID;
var username = process.env.FB_USERNAME;
var password = process.env.FB_PASSWORD;
var nickname = process.env.BOT_NICKNAME || 'Bot';

module.exports = {
  threadId: threadId,
  username: username,
  password: password,
  nickname: nickname
};
