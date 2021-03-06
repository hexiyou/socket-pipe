// Generated by CoffeeScript 1.12.2
(function() {
  var Udp;

  Udp = require('dgram');

  module.exports = (function() {
    function _Class(localAddress, remoteAddress) {
      this.localAddress = localAddress;
      this.remoteAddress = remoteAddress;
      this.connectionPool = {};
      setInterval((function(_this) {
        return function() {
          var connect, index, key, now, ref, results;
          now = Date.now();
          index = 0;
          ref = _this.connectionPool;
          results = [];
          for (key in ref) {
            connect = ref[key];
            if (now - connect.time < 5000) {
              connect.socket.close();
              delete _this.connectionPool[key];
              results.push(console.log("close " + key));
            } else {
              results.push(void 0);
            }
          }
          return results;
        };
      })(this), 10000);
      this.createServer();
    }

    _Class.prototype.createServer = function() {
      var receiver;
      receiver = Udp.createSocket('udp' + this.localAddress.type);
      receiver.bind(this.localAddress.port, this.localAddress.ip);
      receiver.ref();
      receiver.on('error', console.error);
      return receiver.on('message', (function(_this) {
        return function(data, info) {
          var client, key, sender;
          key = _this.requestUdpSocket(info);
          sender = _this.connectionPool[key].socket;
          client = info;
          sender.on('message', function(data, info) {
            console.log("response " + info.address + ":" + info.port);
            if (typeof _this.connectionPool[key] !== 'undefined') {
              _this.connectionPool[key].time = Date.now();
            }
            return receiver.send(data, 0, data.length, client.port, client.address);
          });
          console.log("request " + client.address + ":" + client.port);
          return sender.send(data, 0, data.length, _this.requestUdpPort(_this.remoteAddress.port), _this.remoteAddress.ip);
        };
      })(this));
    };

    _Class.prototype.requestUdpSocket = function(info) {
      var key, now, socket;
      now = Date.now();
      key = info.address + ':' + info.port;
      if (typeof this.connectionPool[key] !== 'undefined') {
        this.connectionPool[key].time = now;
        return key;
      }
      socket = Udp.createSocket('udp' + this.remoteAddress.type);
      socket.bind();
      socket.on('error', function(err) {
        console.error(err);
        socket.close();
        return delete this.connectionPool[key];
      });
      this.connectionPool[key] = {
        time: now,
        socket: socket
      };
      return key;
    };

    _Class.prototype.requestUdpPort = function(port) {
      if (port instanceof Array) {
        return port[0] + Math.floor(Math.random() * (port[1] - port[0] + 1));
      } else {
        return port;
      }
    };

    return _Class;

  })();

}).call(this);
