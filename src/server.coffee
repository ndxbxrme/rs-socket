socketio = require 'socket.io'

module.exports =
  (rs) ->
    sockets = {}
    callbacks = {}
    io = socketio.listen rs.server
    io.on 'connection', (socket) ->
      if server = socket.handshake.query.server
        sockets[server] = sockets[server] or {}
        sockets[server][socket.id] = socket
        socket.on 'user', (user) ->
          socket.user = user
        socket.on 'disconnect', ->
          delete sockets[server][socket.id]
    emit = (server, name, data, users) ->
      for id, socket of sockets[server]
        if users and users.length
          continue if not users.includes socket.user._id
        await socket.emit name, data if socket
    rs.socket =
      setup: (rainstorm) ->
        rainstorm.socket = rainstorm.socket or {}
        rainstorm.socket.emit = rainstorm.emit or (name, data, users) ->
          emit rainstorm.name, name, data, users
        rainstorm.socket.dbFn = rainstorm.dbFn or (args) ->
          argsClone = JSON.parse JSON.stringify args
          for id, socket of sockets[rainstorm.name]
            argsClone.user = socket.user
            if callbacks[rainstorm.name]?[args.op]
              for callback in callbacks[rainstorm.name][args.op]
                continue if not await callback args
            await socket.emit args.op,
              table: args.table
              id: args.id
        rainstorm.socket.on = (name, callback) ->
          callbacks[rainstorm.name] = callbacks[rainstorm.name] or {}
          callbacks[rainstorm.name][name] = callbacks[rainstorm.name][name] or []
          callbacks[rainstorm.name][name].push callback
        rainstorm.socket.off = (name, callback) ->
          callbacks[rainstorm.name][name].splice callbacks[name].indexOf(callback), 1