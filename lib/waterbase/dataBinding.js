/* exports formulate, bindProperty */

/*
 * params:
 *   (src, input1-1, ..., input1-N, ..., srcN, inputN-1, ..., inputN-N,
 *   target, output1, ..., outputN, formula)
 *   input/output are string names of correpsonding object properties
 *   src/target are objects, followed by thier properties
 *   right now does not support non-object src/targets
 *
 *   properties of src objects are used in calculating the target object
 *
 *   the formula is a function
 *   it will be called everytime an input change in one of the src objects
 *   it should accept a list of object, the last being the target
 *   and mutate the target accordingly
 *
*/
var formulate = function(){
  var prefix = '__formulated';
  var i=0;
  var srcMaps = [];
  while (typeof arguments[i] !== 'function'){
    if (typeof arguments[i] === 'object'){
      srcMaps.push({
        src: arguments[i],
        properties: []
      });
    } else {
      srcMaps[srcMaps.length-1].properties.push(arguments[i]);
    }
    i++;
  }
  //now at the formula function
  var formula = arguments[arguments.length-1];
  //the last of srcMaps is the target
  var targetMap = srcMaps.pop();

  console.log('source');
  //let changes on src reflect on target
  srcMaps.forEach(function(srcMap){
    console.log(srcMap.src, typeof srcMap.src.nodeType);
    if (srcMap.src.nodeType && typeof srcMap.src.nodeType === 'number'){
      console.log('dom');
      var observer = new MutationObserver(function(){
        console.log('mutation');
        formula(srcMap.src, targetMap.src);
      });
      observer.observe(srcMap.src, {
        attributes: true,
        childList: true,
        characterData: true
      });
    } else {
      console.log('non-dom');
      srcMap.properties.forEach(function(prop){
        //re-direct property name
        //let change trigger related data
        console.log('binding', srcMap.src, prop);
        Object.defineProperty(srcMap.src, prefix+prop, {
          writable: true,
        });
        srcMap.src[prefix+prop] = srcMap.src.prop;
        Object.defineProperty(srcMap.src, prop, {
          get: function(){
            console.log('get', prop, this[prefix+prop]);
            return this[prefix+prop];
          },
          set: function(value){
            console.log('set', prop, value);
            this[prefix+prop] = value;
            formula(srcMap.src, targetMap.src);
          },
        });
      });
    }
  });
};
