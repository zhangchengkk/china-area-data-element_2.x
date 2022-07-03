const fs = require('fs')
const { fetchData } = require('./fetch')
const { specialCitys, specialProvinces } = require('./special')

setTimeout(async () => {
  const obj = await fetchData();
  Object.assign(obj['86'], specialProvinces)
  const allData = JSON.stringify(Object.assign({}, obj, specialCitys), null, 2)
  fs.writeFileSync('../data.json', allData)
  fs.writeFileSync('../data.js', 'module.exports = ' + allData)
  process.exit(0)
}, 2000);



