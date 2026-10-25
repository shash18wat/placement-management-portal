import Interpreter from 'js-interpreter'

self.onmessage = (event) => {
  const { token, code, cases } = event.data || {}
  if (typeof code !== 'string' || code.length > 12000 || !Array.isArray(cases) || cases.length > 12) {
    self.postMessage({ token, error: 'The solution or test set is too large.' })
    return
  }
  let results = null
  const harness = '\nvar __cases = ' + JSON.stringify(cases) + ';\n' +
    'function __same(a,b){if(a===b)return true;if(a&&b&&typeof a==="object"&&typeof b==="object"){var ak=Object.keys(a),bk=Object.keys(b);if(ak.length!==bk.length)return false;for(var j=0;j<ak.length;j++){if(!__same(a[ak[j]],b[ak[j]]))return false;}return true;}return false;}\n' +
    'function __show(v){var s=JSON.stringify(v);return s===undefined?String(v):s;}\n' +
    'var __out=[];for(var i=0;i<__cases.length;i++){try{var __actual=solution.apply(null,__cases[i].input);__out.push({passed:__same(__actual,__cases[i].expected),expected:__show(__cases[i].expected),actual:__show(__actual)});}catch(e){__out.push({passed:false,expected:__show(__cases[i].expected),actual:"Error: "+String(e)});}}\n' +
    '__report(__out);'
  try {
    const interpreter = new Interpreter(code + '\n' + harness, (instance, globalObject) => {
      instance.setProperty(globalObject, '__report', instance.createNativeFunction((value) => {
        results = instance.pseudoToNative(value)
      }))
    })
    let steps = 0
    while (interpreter.step()) {
      steps += 1
      if (steps > 150000) throw new Error('The solution exceeded the instruction limit.')
    }
    self.postMessage({ token, results: results || [] })
  } catch (error) {
    self.postMessage({ token, error: error && error.message ? error.message : 'The solution could not be run.' })
  }
}