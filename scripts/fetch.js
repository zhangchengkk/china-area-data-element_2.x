// const requestPromise = require("request-promise");
const md5 = require('md5')
const fs = require('fs')
const cheerio = require('cheerio')
const axios = require('axios').default;

// 统计数据数据年份
const OBJ_YEAR = 2021
// 国际统计局网址前缀
const NATINAL_STATISTICS_URL = `http://www.stats.gov.cn/tjsj/tjbz/tjyqhdmhcxhfdm`

/**
 * 获取非港澳台的三级区域
 * @return 省市区 编码：名称
 */
const fetchData = async () => {
  const obj = { "86": {} }
  const cityIds = []
  // 省
  const level0 = await loadPage(`${NATINAL_STATISTICS_URL}/${OBJ_YEAR}/index.html`)
  const els = cheerio.load(level0)
  const list = els('.provincetr td a')
  const urls = []
  list.each((index, el) => {
    const url =
			`${NATINAL_STATISTICS_URL}/${OBJ_YEAR}/${els(el).attr('href')}`
		const data = {
			id: els(el).attr('href').split('.')[0] + '0000',
			name: els(el).text()
		}
    console.log('== province: ', data.id, data.name)
    obj['86'][data.id] = data.name
		urls.push(url)
  })
	
  // 市
	for (const url of urls) {
		const level1 = await loadPage(url)
		const $ = cheerio.load(level1)
		const list = $('.citytr td a')
		const countyUrls = []
		list.each(async(index, el) => {
			const url =
				`${NATINAL_STATISTICS_URL}/${OBJ_YEAR}/${$(el).attr('href')}`
				// filter number
			const text = $(el).text()
			if (!/\d+/.test(text)) {
				const data = {
					id: $(el).attr('href').split('.')[0].slice(3) + '00',
					name: $(el).text()
				}

				const parentId = data.id.slice(0, 2) + '0000'
				if (!obj[parentId]) {
					obj[parentId] = {}
				}
				cityIds.push(data.id)
        console.log('==== city: ', obj["86"][parentId], data.id, data.name)
				obj[parentId][data.id] = data.name
			}
			countyUrls.push(url)
		})
    // 区
		for (const url of countyUrls) {
			const level2 = await loadPage(url)
			const $ = cheerio.load(level2)
			const list = $('.countytr td, .towntr td')
			list.each(async(index, el) => {
				const link = $(el).find('a')
				let data = {}
				if (link.length) {
					if (!/\d+/.test($(el).text())) {
						data = {
							id: $(link[0]).attr('href').split('.')[0].split('/')[1],
							name: $(el).text()
						}
					}
				} else {
					if (!/\d+/.test($(el).text())) {
						data = {
							id: $(list[index - 1]).text().replace(/0+$/g, ''),
							name: $(el).text()
						}
					}
				}

				if (data.id) {
					const parentId = data.id.slice(0, 4) + '00'
					if (!obj[parentId]) {
						obj[parentId] = {}
					}
          console.log('====== 区: ', data.id, data.name)
					obj[parentId][data.id] = data.name
				}
			})
		}
	}
  return obj;
}

async function loadPage(url) {
  let content = ''
  const id = md5(url)
  const fileName = `./temp/${id}.html`
  if(fs.existsSync(fileName)) {
    content = fs.readFileSync(fileName, 'utf-8')
  } else {
    const res = await axios.get(url)
    content = res.data
		fs.writeFileSync(fileName, res.data)
  }
  return content
}

module.exports = {
  fetchData
}




