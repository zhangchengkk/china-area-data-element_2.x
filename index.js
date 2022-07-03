import CHINA_AREA_DATA from './data'

// 先取外层省级数据
const provinceList = CHINA_AREA_DATA['86'] // 省份对象

// [key: 区域码]: '地名'。
const CodeToText = {}
// [key: '地名']: '区域码'
const TextToCode = {}
// 三级数据Object
const regionData = []


CodeToText[''] = '全部'

for (const prop in provinceList) {
  regionData.push({
    value: prop, 
    label: provinceList[prop]
  })
  CodeToText[prop] = provinceList[prop]
  TextToCode[provinceList[prop]] = {
    code: prop
  }
  TextToCode[provinceList[prop]]['全部'] = {
    code: ''
  }
}

for (let i = 0, len = regionData.length; i < len; i++) {
  const provinceCode = regionData[i].value
  const provinceText = regionData[i].label
  const provinceChildren = []
  for (const prop in CHINA_AREA_DATA[provinceCode]) {
    provinceChildren.push({
      value: prop,
      label: CHINA_AREA_DATA[provinceCode][prop]
    })
    CodeToText[prop] = CHINA_AREA_DATA[provinceCode][prop]
    TextToCode[provinceText][CHINA_AREA_DATA[provinceCode][prop]] = {
      code: prop
    }
    TextToCode[provinceText][CHINA_AREA_DATA[provinceCode][prop]]['全部'] = {
      code: ''
    }
  }
  if (provinceChildren.length) {
    regionData[i].children = provinceChildren
  }
}

for (let i = 0, len = regionData.length; i < len; i++) {
  const province = regionData[i].children
  const provinceText = regionData[i].label
  if (province) {
    for (let j = 0, len = province.length; j < len; j++) {
      const cityCode = province[j].value
      const cityText = province[j].label
      const cityChildren = []
      for (const prop in CHINA_AREA_DATA[cityCode]) {
        cityChildren.push({
          value: prop,
          label: CHINA_AREA_DATA[cityCode][prop]
        })
        CodeToText[prop] = CHINA_AREA_DATA[cityCode][prop]
        TextToCode[provinceText][cityText][CHINA_AREA_DATA[cityCode][prop]] = {
          code: prop
        }
      }
      if (cityChildren.length) {
        province[j].children = cityChildren
      }
    }
  }
}

export default regionData;
export {
  regionData,
  CodeToText,
  TextToCode
};
