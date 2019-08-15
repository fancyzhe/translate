const axios = require('axios');
const MD5 =  require('./md5.js')

const express = require('express');
const en = require('./en.js')
const fs = require('fs');
const app = express();
var from = 'zh';
var key = 'DLpzVkcj_yjQJjPNZKYc';
var to = 'en';
var appid = '20190815000326554';
var salt = (new Date).getTime();
// 引入工具模块
var ProgressBar = require('./progress/progress-bar');
 
// 初始化一个进度条长度为 50 的 ProgressBar 实例
var pb = new ProgressBar('翻译进度', 50);
const getEn=(query)=>{
    var str1 = appid + query + salt +key;
    var sign = MD5(str1);
    return axios.get("http://api.fanyi.baidu.com/api/trans/vip/translate",{
        params:{
            q: query,
            appid: appid,
            salt: salt,
            from: from,
            to: to,
            sign: sign
        }
    })
}

const writeFile=(text)=>{
    fs.writeFile('./toEn.json', text+"\n"+"\n",  function(err) {
        if (err) {
            throw err;
        } 
    });
}

app.get("/",(req,res)=>{

    const enKeys = Object.keys(en);
    let count = 0;
    let result  = {};
    let timeId = setInterval(()=>{
        let key = enKeys[count];
        if(count > enKeys.length){
            clearInterval(timeId);
            return;
        }
        getEn(enKeys[count]).then(enRes=>{
            en[key] = enRes.data.trans_result && enRes.data.trans_result[0].dst;
            
        });
        pb.render({ completed: count, total: enKeys.length });
        count ++;
    },100)   
    setTimeout(()=>{
        writeFile(JSON.stringify(en));
        console.log("\n writeFile success");
    },(enKeys.length+10) * 100)
    res.send(result)
})


app.listen(3000)