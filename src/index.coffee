module.exports = if typeof(window) is 'undefined' then require('./server') else require('./client')