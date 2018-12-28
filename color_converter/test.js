let converter = require('./main.js');
const convert = new converter();

(async function() {
  let obj = await convert['hex_2_pantone']('10ef3a')
  console.log(obj);
})();
