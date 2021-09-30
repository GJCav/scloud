'use strict';

const OS = require('os');
const Path = require('path');
const FS = require('fs');

let option = null;

function CheckOption(){
    if(option) return true;
    let optionPath = Path.resolve(__dirname, '../scloud.json');
    if(FS.existsSync(optionPath)){
        let json = FS.readFileSync(optionPath);
        option = JSON.parse(json);
        return true;
    }else{
        return false;
    }
}

function GetMyIP(){
    let ifaces = OS.networkInterfaces();
    let rtn = [];
    for(let face in ifaces){
        if(face.search(/(vEthernet|VMware)/i) != -1) continue;
        for(let info of ifaces[face]){
            if(info.family != 'IPv4') continue;
            if(info.internal) continue;
            rtn.push(info.address);
        }
    }
    return rtn;
}

function GetHomePath(){
    let home = process.cwd();
    let flag = false;
    for(let arg of process.argv){
        if(arg.startsWith('-p=')){
            home = arg.substring(arg.indexOf('=')+1);
            flag = true;
            break;
        }
    }
    if(!flag){
        if(CheckOption()){
            if(option.homepath){
                home = option.homepath;
            }
        }
    }
    return home;
}

function GetPort(){
    let port = 80;
    let flag = false;
    for(let arg of process.argv){
        if(arg.startsWith('-port=')){
            port = parseInt(arg.substring(arg.indexOf('=')+1));
            flag = true;
            break;
        }
    }
    if(!flag && CheckOption() && option.port){
        port = option.port;
    }
    return port;
}

module.exports = {
    GetMyIP: GetMyIP,
    homepath: GetHomePath(),
    port: GetPort()
}