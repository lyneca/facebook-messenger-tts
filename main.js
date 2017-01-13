var say = require('say')
var login = require('facebook-chat-api')
var prompt = require('prompt')
var log = require('npmlog')

var msg = ''
var ready = true
var queue = []
var lastUser = ''

function read() {
  l = queue[0]
  message = l[0]
  ret = l[1]
  for (var prop in ret) {
    if (ret.hasOwnProperty(prop)) {
      if (message.attachments.length > 0) {
        msg = ret[prop].firstName + ' sent an attachment.'
      } else {
        if (message.body.match(/\w\w+|[IiAa]/)) {
          msg = message.body
          if (lastUser != message.senderID) {
            msg = ret[prop].firstName + ' says. ' + msg
            lastUser = message.senderID
          }
        } else {
          msg = ret[prop].name + ' sent an emoji.'
        }
      }
      log.info('say', 'saying "' + msg + '"')
      say.speak(msg, '', 1, function() {
        queue.shift()
        if (queue.length > 0) {
          read()
        }
      })
    }
  }
}

var schema = {
  properties: {
    email: {
      description: 'Facebook Email',
      required: true
    },
    password: {
      description: 'Facebook Password',
      hidden: true,
      required: true,
      replace: '*'
    }
  }
}

prompt.start()

prompt.get(schema, function (err, res) {
  login({
      email: res.email,
      password: res.password
  }, function(err, api) {
    if (err) {
        return console.error(err)
    }
    api.setOptions({
        logLevel: 'warn'
    })
    api.listen(function(err, message, stopListening) {
      if (message.type == 'message') {
        log.http('recv', 'received message')
        api.getUserInfo(message.senderID, function(err, ret) {
          if (err) {
            return log.error(err)
          }
          // arr = message.body.split(/[.,!?]/)
          // for (var i = 0; i < len)

          queue.push([message, ret])
          if (queue.length == 1) {
            read()
          }
        })
      }
    })
  })
})
