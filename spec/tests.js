var assert = chai.assert;
var should = chai.should();


describe('Waterbase Javascript Library', function () {
  var url = 'http://localhost:9000';
  var waterbase = new Waterbase(url);

  db = {
    Users: [
      {id: '1', username: 'aaron', age: 20},
      {id: '2', username: 'john', age: 20},
      {id: '3', username: 'joe', age: 20},
      {id: '4', username: 'jeff', age: 20},
      {id: '5', username: 'hello', age: 20}
    ],
    Messages: [
      {id: '1', text: 'testing'},
      {id: '2', text: 'testing'},
      {id: '3', text: 'testing'},
      {id: '4', text: 'testing'}
    ]
  };

  describe('Collections', function () {
    it('should have methods list, show, create, update, delete', function (done) {
      var collection = waterbase.collection('Test');

      collection.should.have.property('list');
      collection.should.have.property('show');
      collection.should.have.property('create');
      collection.should.have.property('update');
      collection.should.have.property('delete');

      done();
    });
    it('should set base url when passed to constructor', function (done) {
      assert.equal(waterbase.url, url);

      done();
    });
    xit('should return data in the form of models', function (done) {
      done();
    });
  });
  describe('Models', function () {
    xit('should have methods update and destroy', function (done) {
      var waterbase = new Waterbase();
      var water = waterbase.create();

      water.should.have.property('update');
      water.should.have.property('delete');

      done();
    });
  });
});