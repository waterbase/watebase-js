
##Set up
```javascript
  var waterbase = new Waterbas(host, options, binding);
```
host: your custom server host name  
options: socket options  
binding: optional. the function to call to update the data binding.   
e.g. in angular, you might want to pass in  
```javascript
  function(){
    $rootScope.$digest;
  };
```

##Accessing collections and models
```javascript
  var myFirstCollection = waterbase.collection(myFirstCollectionName);
  
  var myFirstModelInstance = myFirstCollection.create({
    attribute1: value1,
    attribute2: value2
    //...
  });
```

##Restful operations
```javascript
  //get a collection from the database
  //if it doesn't yet exists, a new collection
  //is created with a blank schema
  var collection = waterbase.collection(collection);

  //get a list of models. this list is never reassigned
  //thus you always retain a reference the update list
  listOfModelInstances = collection.list();
  
  //update models in the collection
  //takes mongo style where and set options
  collection.update(where, set, callback);
  
  //delete all objects in the collection
  collection.deleteAll(callback);
  
  //create a model using the object passed in
  //if object contains an attribute not already defined
  //this will define it
  collection.create(object, callback);
  
  //show a single model based on the object id literal
  var oneModelInstance = collection.show(id);
  
  //update the single model instance based on the set option
  oneModelInstance.update(set, callback);
  
  //delete this object. this removes the object 
  //from the collection and any list associated
  //but the calling variable still retain a copy
  oneModelInstance.delete(callback);
  
```
