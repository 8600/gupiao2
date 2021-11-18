const { array } = require('assert-plus');
var request = require('request');

let mock = `sz002307,北新路桥,1,1,0.1
`
let lineArr = mock.split('\n')
console.log(lineArr)

function sendMessage() {
  var options = {
    'method': 'POST',
    'url': 'https://hanshu.run/gzh?id=ohxET6AlPIDFoU1KFeFKZGb_SG8w&template=EvpHwEBpG2rkLHYMtIH2ADww9JCQwEaWlTAqyoPF6xQ',
    'headers': {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: '{"first":{"value":"股票信息提醒","color":"#173177"},"keyword1":{"value":"请求处理系统","color":"#173177"},"keyword2":{"value":"程序已重新上线","color":"#173177"},"keyword3":{"value":"现在","color":"#173177"},"remark":{"value":"","color":"#173177"}}'
  
  };
  request(options, function (error, response) {
    if (error) throw new Error(error);
    console.log(response.body);
  });
}

function checkItem (element) {
  var options = {
    'method': 'GET',
    'url': 'http://hq.sinajs.cn/list=' + element[0],
    'headers': {
    }
  };
  request(options, function (error, response) {
    if (error) throw new Error(error);
    let body = response.body
    body = body.replace('var hq_str_sz', '')
    body = body.replace('="', ',')
    body = body.replace('";', '')
    let temp = body.split(',')
    console.log(element);
    // 涨跌幅
    let zhangdie = temp[4] - temp[2]
    console.log(zhangdie)
    if (zhangdie > element[2]) {
      sendMessage()
    }
  });
}

lineArr.forEach(element => {
  let temp = element.split(',')
  if (temp[0]) {
    checkItem(temp)
  }
});