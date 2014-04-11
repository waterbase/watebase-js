/*
 * Create connection to server through sockets
 *
 * @param {String} url
 */

var Waterbase = function (url, options) {
  this.url = url || 'http://localhost';
  this.options = options || {
    verbose: false
  };

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

  this._storage = [];

  this.init();
};

Collection.prototype.init = function() {
  var collection = this;

  collection.io.on('connect', function () {
    console.log('connected to socket server.');

    // Retrieve all models on start
    collection.retrieveAll(function (models) {
      collection._storage = collection._storage.concat(models);
    });

    // Data Binding Listener
    collection.io.on('broadcast', function (eventType, data) {
      // Retrieve newly created model from server
      if (eventType === 'create') {
        console.log('Event "create"');
        collection.retrieveOne(data[0]);

      // Delete all items from local collection
      } else if (eventType === 'deleteAll') {
        console.log('Event "deleteAll": ' + collection.name + ' emptied.');
        collection._storage = [];
      }
    });
  });
};

Collection.prototype.list = function() {
  return this._storage;
};

// Revise for constant time: Hash table?
Collection.prototype.show = function(id) {
  var result;
  this._storage.forEach(function (model) {
    if (model.id === id) {
      result = model;
    }
  });

  return result;
};

/**
 * Gets all models in collection from server
 *
 * @param {Function} callback passed response data
 */

Collection.prototype.retrieveAll = function(callback) {
  var collection = this;

  this.io.emit(
    'retrieveAll',
    this.name,
    this.handleResponse(function (data) {
      data.forEach(function (props, index) {
        data[index] = new Model(props, collection.name, collection.io);
      });

      if (callback) callback(data);
    })
  );
};

/**
 * Gets single document from collection
 *
 * @param {Object} obj Describe requrested document
 * @param {Function} callback Use response data
 */

Collection.prototype.retrieveOne = function(id, callback) {
  if (!id) {
    throw 'first argument should be an document ID';
  }

  var collection = this;

  this.io.emit(
    'retrieveOne',
    this.name,
    id,
    this.handleResponse(function (data) {
      var model = new Model(data, collection.name, collection.io);
      collection._storage.push(model);

      if (callback) callback(model);
    })
  );
};

/**
 * Create new document in collection
 *
 * @param {Function} callback to returned data
 */

Collection.prototype.create = function(set, callback) {
  if (!set) {
    throw 'first argument should be an object';
  }

  var collection = this;

  this.io.emit(
    'create',
    this.name,
    set,
    this.handleResponse(function (data) {
      console.log('Successfully created new model');
      var model = new Model(set, collection.name, collection.io);
      if (callback) callback(model);

      collection._storage.push(model); // TODO: Check data type
    })
  );
};

Collection.prototype.update = function(where, set, callback) {
  if (!where || !set) {
    throw 'first argument should be an object';
  } else if (!callback) {
    throw 'third argument should be a callback';
  }

  var collection = this;

  this.io.emit(
    'update',
    this.name,
    where,
    set,
    this.handleResponse(function (data) {
      if (callback) callback(data);

      // TODO: finish batch updating
      data.forEach(function (model) {
        collection._storage.push(model);
      });
    })
  );
};

Collection.prototype.deleteAll = function(callback) {
  var collection = this;
  this.io.emit(
    'deleteAll',
    this.name,
    this.handleResponse(function (deleted) {
      if (deleted) {
        collection._storage = [];
      }
    })
  );
};

Collection.prototype.handleResponse = function(callback) {
  return function (err, data) {
    if (err) {
      throw err;
    } else {
      if (callback) callback(data);
    }
  };
};

var bindProperty = function (property, value, context) {
  var prefix = '__bound';

  Object.defineProperty(context, prefix + property, {
      value: value,
      writable: true
    });

  Object.defineProperty(context, property, {
    get: function () {
      return this[prefix + property];
    },
    set: function (value) {
      var context = this;
      var set = {};

      set[property] = value;
      this.update(set, function (data) {
        context[prefix + property] = value;
      });
    }
  });
};

/**
 * Class: Model
 *
 * @param {Object} obj Data for new model
 * @param {String} Collection model belongs to
 * @param {connection} Reference to socket
 */

var Model = function (obj, collectionName, connection) {
  this.collection = collectionName;
  this.io = connection;

  var context = this;
  var prefix = '__bound';

  // Data binding listeners
  this.io.on('broadcast', function (eventType, data) {
    if (eventType === 'update') {
      data.forEach(function (model) {
        if (model.id === context.id) {
          console.log('Updated', model.id);
          for (var property in model) {
            context[prefix + property] = model[property];
          }
        }
      });
    }
  });

  for (var prop in obj) {
    bindProperty(prop, obj[prop], this);
  }
};

/**
 * Updates a single object
 *
 * @param {Object} Properties to be updated
 * @param {Function} Callback upon sucess/failure
 */

Model.prototype.update = function(set, callback) {
  this.io.emit(
    'updateOne',
    this.collection,
    this.id,
    set,
    this.handleResponse(function (data) {
      console.log('Successfully updated ', data);
      if (callback) callback(data);
    })
  );
};

/**
 * Deletes a single model
 */

Model.prototype.delete = function () {
  this.io.emit(
    'deleteOne',
    this.collection,
    this.id,
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
      if (callback) callback(data);
    }
  };
};
