const { array } = require('assert-plus');
const request = require('request');
const iconv = require('iconv-lite');
const schedule = require("node-schedule");

Date.prototype.Format = function (fmt) { // author: meizz
  var o = {
    "M+": this.getMonth() + 1, // 月份
    "d+": this.getDate(), // 日
    "h+": this.getHours(), // 小时
    "m+": this.getMinutes(), // 分
    "s+": this.getSeconds(), // 秒
    "q+": Math.floor((this.getMonth() + 3) / 3), // 季度
    "S": this.getMilliseconds() // 毫秒
  };
  if (/(y+)/.test(fmt))
    fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
  for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
      return fmt;
}

let keySto = {}

function sendMessage(name, text1, text3, key) {
  if (keySto[key]) {
    return
  }
  keySto[key] = true
  var options = {
    'method': 'POST',
    'url': 'https://hanshu.run/gzh?id=ohxET6Js9dbeLHvxOO7uiO9ToTGg&template=EvpHwEBpG2rkLHYMtIH2ADww9JCQwEaWlTAqyoPF6xQ',
    'headers': {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: `{"first":{"value":"股票信息提醒","color":"#173177"},"keyword1":{"value":"${name}","color":"#173177"},"keyword2":{"value":"${text1}","color":"#173177"},"keyword3":{"value":"${new Date().Format("yyyy-MM-dd hh:mm:ss")}","color":"#173177"},"remark":{"value":"${text3}","color":"#173177"}}`
  
  };
  request(options, function (error, response) {
    if (error) throw new Error(error);
    console.log(response.body);
  });
}

function getCode (str) {
  if (str.startsWith('600') || str.startsWith('601') || str.startsWith('603') || str.startsWith('605') || str.startsWith('688') || str.startsWith('11') || str.startsWith('600')) {
    return 'sh' + str
  }
  if (str.startsWith('000') || str.startsWith('001') || str.startsWith('002') || str.startsWith('003') || str.startsWith('300') || str.startsWith('301') || str.startsWith('12')) {
    return 'sz' + str
  }
}
let checkIndex = 0
let tempSto = {}
function checkItem (element, checkIndex) {
  // console.log(element)
  var options = {
    'method': 'GET',
    'url': 'http://hq.sinajs.cn/list=' + getCode(element[0]),
    'encoding': null,
    'headers': {
    }
  };
  request(options, function (error, response, body) {
    if (error) {
      console.log(error)
      return
    }
    body =  iconv.decode(body, 'gb2312');
    body = body.replace('var hq_str_sz', '')
    body = body.replace('var hq_str_sh', '')
    body = body.replace('="', ',')
    body = body.replace('";', '')
    let temp = body.split(',')
    // console.log(temp);
    // 涨跌幅
    let zhangdie = parseFloat((parseFloat(temp[4]) / parseFloat(temp[3]) * 100 - 100).toFixed(2))
    const temp2 = `涨幅: ${element[2]},跌幅: ${element[3]},涨速: ${element[4]},跌速: ${element[5]}`
    // console.log(temp[1] + '|' + temp[4] + '|' + temp[3] + '|' + zhangdie)
    if (zhangdie > parseFloat(element[2])) {
      console.log(`${temp[1]}达到了涨幅条件!`)
      console.log(`${temp[1]} ${temp[0]}`, `涨幅: ${zhangdie.toFixed(2)}`, temp2, element.join(',') + '2')
      sendMessage(`${temp[1]} ${temp[0]}`, `涨幅: ${zhangdie.toFixed(2)}`, temp2, element.join(',') + '2')
    }
    if (zhangdie < -parseFloat(element[3]) && zhangdie != -100) {
      console.log('达到跌幅条件!')
      console.log(`${temp[1]} ${temp[0]}`, `跌幅: ${zhangdie.toFixed(2)}`, temp2, element.join(',') + '3')
      sendMessage(`${temp[1]} ${temp[0]}`, `跌幅: ${zhangdie.toFixed(2)}`, temp2, element.join(',') + '3')
    }
    if (checkIndex == 0) {
      tempSto[temp[1]] = zhangdie
      // console.log(tempSto)
    }
    
    if (checkIndex == 30) {
      zhangsu = zhangdie - tempSto[temp[1]]
      console.log(`${temp[1]} ${zhangdie} ${tempSto[temp[1]]} 涨速:${zhangsu}`)
      if (zhangsu >= parseFloat(element[4])) {
        console.log(`${temp[1]}达到了涨速条件!`)
        sendMessage(`${temp[1]} ${temp[0]}`, `涨速: ${zhangsu.toFixed(2)}`, temp2, element.join(',') + '4')
      }
      if (zhangsu <= -parseFloat(element[5])) {
        console.log(`达到跌速条件${zhangsu.toFixed(2)}!`)
        sendMessage(`${temp[1]} ${temp[0]}`, `跌速: ${zhangsu.toFixed(2)}`, temp2, element.join(',') + '5')
      }
    }
    
  });
}

// 获取用户数据
var options = {
  'method': 'POST',
  'url': 'https://user.hanshu.run/adminGetTypeData',
  'headers': {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    "username": "admin",
    "session": "5Cm9OU_sWViuhNPXPj-3Bg",
    "type": "股票监控"
  })

};
request(options, function (error, response) {
  if (error) throw new Error(error);
  
  let userArr = JSON.parse(response.body)['data']
  startV = userArr[0]
  let lineArr = startV.value.data.split('\n')
  
  schedule.scheduleJob('0/10 * 9-11,13-14 * * 1,2,3,4,5', function(){
    console.log('检测:' + lineArr.length)
    lineArr.forEach(element => {
      let temp = element.split(',')
  
      if (temp[0]) {
        checkItem(temp, checkIndex)
      }
    });
    checkIndex++
    if (checkIndex >= 31) {
      checkIndex = 0
    }
  });
});

function saveUserData (data) {
  var options = {
    'method': 'POST',
    'url': 'https://user.hanshu.run/adminUpdata',
    'headers': {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "username": "admin",
      "session": "5Cm9OU_sWViuhNPXPj-3Bg",
      "userid": 2053,
      "type": "股票监控",
      "value": data
    })
  };
  request(options, function (error, response) {
    if (error) throw new Error(error);
    console.log(response.body);
  });
  
}

