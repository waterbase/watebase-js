/*
 * Create connection to server through sockets
 *
 * @param {String} url
 */
var Waterbase = function (url, options) {

  this.url = url || 'http://localhost';
  options = options || {};

  // Open Socket Connection
  this.connection = io.connect(url);
};

/**
 * Create Instance of Collection Class
 *
 * @param {String} collectionName of the collection
 * @return {collection} reference to collection
 */

Waterbase.prototype.collection = function (collectionName) {
  return new Collection(collectionName, this.connection);
};

/**
 * Class: Collection
 *
 * @param {String} name
 * @param {connection}
 */

var Collection = function (name, connection) {
  this.name = name;
  this.io = connection;

  // Listener for server
  this.io.on('broadcast', function (data) {
    console.log(data);
  });
};

/**
 * Gets all documents from collection
 *
 * @param {Function} cb Use response data
 */

Collection.prototype.list = function(cb) {
  if (!cb) {
    throw 'needs a callback function';
  }

  this.io.emit('list', this.name, function (err, data) {
    this.handleResponse(err, function (data) {
      data.forEach(function (item, index) {
        data[index] = new Model(item, this.connection);
      });

      cb(data);
    });
  });
};

/**
 * Gets single document from collection
 *
 * @param {Object} obj Describe requrested document
 * @param {Function} cb Use response data
 */

Collection.prototype.show = function(obj, cb) {
  if (!obj) {
    throw 'first argument should be an object';
  } else if (!cb) {
    throw 'second argument should be a callback';
  }

  // change obj to document _id
  this.io.emit('show', this.name, obj, function (err, data) {
    this.handleResponse(err, function (data) {
      cb(new Model(data));
    });
  });
};

/**
 * Create new document/s in collection
 *
 * @param {Function} cb to returned data
 */

Collection.prototype.create = function(obj, cb) {
  if (!obj) {
    throw 'first argument should be an object';
  } else if (!cb) {
    throw 'second argument should be a callback';
  }

  this.io.emit('create', this.name, obj, function (err, data) {
    this.handleResponse(err, function (data) {
      cb(data);
    });
  });
};

Collection.prototype.update = function(obj, cb) {
  if (!obj) {
    throw 'first argument should be an object';
  } else if (!cb) {
    throw 'second argument should be a callback';
  }

  this.io.emit('edit', this.name, obj, function (err, data) {
    this.handleResponse(err, function (data) {
      cb(data);
    });
  });
};

Collection.prototype.delete = function(obj, cb) {
  if (!obj) {
    throw 'first argument should be an object';
  } else if (!cb) {
    throw 'second argument should be a callback';
  }

  this.io.emit('delete', this.name, obj, function (err, data) {
    this.handleResponse(err, function (data) {
      cb(data);
    });
  });
};

Collection.prototype.handleResponse = function(err, cb) {
  if (err) {
    throw err;
  } else {
    cb();
  }
};

var Model = function (obj, connection) {
  this.io = connection;

  for (var key in obj) {
    this[key] = obj[key];
  }
};

Model.prototype.update = function() {
  this.io.emit('updateOne', this, function (err, data) {
    this.handleResponse(err, function (data) {
      console.log('Successfully updated ', data);
    });
  });
};

Model.prototype.delete = function() {
  this.io.emit('deleteOne', {_id: this._id}, function (err, data) {
    this.handleResponse(err, function (data) {
      console.log('Successfully deleted ', data);
    });
  });
};

Model.prototype.handleResponse = function(err, cb) {
  if (err) {
    throw err;
  } else {
    cb();
  }
};