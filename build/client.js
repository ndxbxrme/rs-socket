(function() {
  var angular, io, moduleName;

  io = require('socket.io-client');

  angular = window.angular || require('angular');

  moduleName = 'rs-socket';

  angular.module(moduleName, []).factory('socket', function() {
    var socket;
    socket = io({
      query: {
        server: document.body.attributes['server'].value
      }
    });
    return socket;
  });

  module.exports = moduleName;

}).call(this);

//# sourceMappingURL=client.js.map
