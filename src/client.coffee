io = require 'socket.io-client'
angular = window.angular or require 'angular'
moduleName = 'rs-socket'
angular.module moduleName, []
.factory 'socket', ->
  socket = io
    query:
      server: document.body.attributes['server'].value
  socket
module.exports = moduleName