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
 * @param {String} name Collection name
 * @param {Connection} Reference to socket
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
 * @param {Function} callback Use response data
 */

Collection.prototype.list = function(callback) {
  if (!callback) {
    throw 'needs a callback function';
  }

  this.io.emit(
    'list',
    this.name,
    this.handleResponse(function (data) {
      data.forEach(function (props, index) {
        data[index] = new Model(props, this.name, this.connection);
      });
      callback(data);
    })
  );
};

/**
 * Gets single document from collection
 *
 * @param {Object} obj Describe requrested document
 * @param {Function} callback Use response data
 */

Collection.prototype.show = function(obj, callback) {
  if (!obj) {
    throw 'first argument should be an object';
  } else if (!callback) {
    throw 'second argument should be a callback';
  }

  this.io.emit(
    'show',
    this.name,
    obj._id,
    this.handleResponse(function (data) {
      callback(new Model(data, this.name, this.connection));
    })
  );
};

/**
 * Create new document/s in collection
 *
 * @param {Function} callback to returned data
 */

Collection.prototype.create = function(set, callback) {
  if (!set) {
    throw 'first argument should be an object';
  } else if (!callback) {
    throw 'second argument should be a callback';
  }

  this.io.emit(
    'create',
    this.name,
    set,
    this.handleResponse(callback)
  );
};

Collection.prototype.update = function(where, set, callback) {
  if (!where || !set) {
    throw 'first argument should be an object';
  } else if (!callback) {
    throw 'third argument should be a callback';
  }

  this.io.emit(
    'update',
    this.name,
    where,
    set,
    this.handleResponse(callback)
  );
};

Collection.prototype.deleteAll = function(callback) {
  if (!callback) {
    throw 'first argument should be a callback';
  }

  this.io.emit(
    'deleteAll',
    this.name,
    this.handleResponse(callback)
  );
};

Collection.prototype.handleResponse = function(callback) {
  return function (err, data) {
    if (err) {
      throw err;
    } else {
      callback(data);
    }
  };
};

/**
 * Class: Model
 *
 * @param {Object} obj Data for new model
 * @collectionName {String} Collection model belongs to
 * @param {connection} Reference to socket
 */

var Model = function (obj, collectionName, connection) {
  this.collection = collectionName;
  this.io = connection;

  for (var key in obj) {
    this[key] = obj[key];
  }
};

/**
 * Updates a single object
 *
 * @param {Object} Properties to be updated
 * @param {Function} Callback upon sucess/failure
 */

Model.prototype.update = function(obj, callback) {
  this.io.emit(
    'updateOne',
    this.collection,
    this._id,
    obj,
    this.handleResponse(function (data) {
      console.log('Successfully updated ', data);
      callback(data);
    })
  );
};

/**
 * Deletes a single object
 */

Model.prototype.delete = function () {
  this.io.emit(
    'deleteOne',
    this.collection,
    this._id,
    this.handleResponse(function (data) {
      console.log('Successfully deleted ', data);
    })
  );
};

Model.prototype.handleResponse = function (callback) {
  return function (err, data) {
    if (err) {
      throw err;
    } else {
      callback(data);
    }
  };
};
