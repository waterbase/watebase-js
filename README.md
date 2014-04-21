

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
  var collection = waterbase.collection(collection);

  listOfModelInstances = collection.list();
```
