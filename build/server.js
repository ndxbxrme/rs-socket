(function() {
  var socketio;

  socketio = require('socket.io');

  module.exports = function(rs) {
    var callbacks, emit, io, sockets;
    sockets = {};
    callbacks = {};
    io = socketio.listen(rs.server);
    io.on('connection', function(socket) {
      var server;
      if (server = socket.handshake.query.server) {
        sockets[server] = sockets[server] || {};
        sockets[server][socket.id] = socket;
        socket.on('user', function(user) {
          return socket.user = user;
        });
        return socket.on('disconnect', function() {
          return delete sockets[server][socket.id];
        });
      }
    });
    emit = async function(server, name, data, users) {
      var id, ref, results, socket;
      ref = sockets[server];
      results = [];
      for (id in ref) {
        socket = ref[id];
        if (users && users.length) {
          if (!users.includes(socket.user._id)) {
            continue;
          }
        }
        if (socket) {
          results.push((await socket.emit(name, data)));
        } else {
          results.push(void 0);
        }
      }
      return results;
    };
    return rs.socket = {
      setup: function(rainstorm) {
        rainstorm.socket = rainstorm.socket || {};
        rainstorm.socket.emit = rainstorm.emit || function(name, data, users) {
          return emit(rainstorm.name, name, data, users);
        };
        rainstorm.socket.dbFn = rainstorm.dbFn || async function(args) {
          var argsClone, callback, i, id, len, ref, ref1, ref2, results, socket;
          argsClone = JSON.parse(JSON.stringify(args));
          ref = sockets[rainstorm.name];
          results = [];
          for (id in ref) {
            socket = ref[id];
            argsClone.user = socket.user;
            if ((ref1 = callbacks[rainstorm.name]) != null ? ref1[args.op] : void 0) {
              ref2 = callbacks[rainstorm.name][args.op];
              for (i = 0, len = ref2.length; i < len; i++) {
                callback = ref2[i];
                if (!(await callback(args))) {
                  continue;
                }
              }
            }
            results.push((await socket.emit(args.op, {
              table: args.table,
              id: args.id
            })));
          }
          return results;
        };
        rainstorm.socket.on = function(name, callback) {
          callbacks[rainstorm.name] = callbacks[rainstorm.name] || {};
          callbacks[rainstorm.name][name] = callbacks[rainstorm.name][name] || [];
          return callbacks[rainstorm.name][name].push(callback);
        };
        return rainstorm.socket.off = function(name, callback) {
          return callbacks[rainstorm.name][name].splice(callbacks[name].indexOf(callback), 1);
        };
      }
    };
  };

}).call(this);

//# sourceMappingURL=server.js.map
