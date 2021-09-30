'use strict';

const $ = require('jquery');

function ls(success, failed){
    $.ajax('/ls', {
        method: 'get',
        dataType: 'json',
        success: success,
        failed: failed
    });
}

function nofilter(){
    return true;
}

function regexfilter(pat){
    let regex = new RegExp(pat);
    return (info) => {
        return regex.test(info.name);
    }
}

function SetFilter(str){
    if(!str){
        module.exports.filter = nofilter;
    }else if(str.startsWith('/')){
        module.exports.filter = regexfilter(str.substring(1));
    }else{
        module.exports.filter = (info) => info.name.indexOf(str) != -1;
    }
}

function sortByType(a, b){
    a = a.name.substring(a.name.lastIndexOf('.')+1);
    b = b.name.substring(b.name.lastIndexOf('.')+1);
    return a < b ? -1 : a == b ? 0 : 1;
}

function sortByName(a, b){
    a = a.name;
    b = b.name;
    return a < b ? -1 : a == b ? 0 : 1;
}

function sortBySize(a, b){
    a = a.size;
    b = b.size;
    return a - b;
}

function sortByTime(a, b){
    a = new Date(a.time);
    b = new Date(b.time);
    return a < b ? -1 : a == b ? 0 : 1;
}

const sorters = {
    sym: ['▲', '▼'],
    type: {
        val: 0,
        sorters: [
            sortByType,
            (a, b) => sortByType(b, a)
        ]
    },
    name: {
        val: 0,
        sorters: [
            sortByName,
            (a, b) => sortByName(b, a)
        ]
    },
    size: {
        val: 0,
        sorters: [
            sortBySize,
            (a, b) => sortBySize(b, a)
         ]
    },
    time: {
        val: 0,
        sorters: [
            sortByTime,
            (a, b) => sortByTime(b, a)
        ]
    }
}

function SetSorterEvt(event){
    let src = $(event.target);
    let type = src.attr('data-sort');
    sorters[type].val ^= 1;
    module.exports.sortby = sorters[type].sorters[sorters[type].val];
    src.text(sorters.sym[sorters[type].val]);
}

function prettySize(size){
    const unit = ['B', 'K', 'M', 'G', 'T'];
    let i = 0;
    while(size >= 1024 && i < unit.length-1){
        size /= 1024;
        i++;
    }
    if(size >= 512 && i < unit.length-1){
        size /= 1024;
        i++;
    }
    return `${size.toFixed(1)} ${unit[i]}`;
}

function AddUploadTask(file, qArea){
    let qPgs = qArea.find('.progress-bar');
    let taskObj = {
        updateName: () => {
            qArea.find('h6').text(file.name);
        },
        updateSpeed: (pct, spd) => {
            qPgs.text(`${pct}% ${prettySize(spd)}/s`);
            qPgs.css('width', `${pct}%`);
        },
        updateSuccess: () => {
            qArea.attr('class', 'alert alert-success');
            qArea.find('.badge').text('Done');
            qPgs.attr('class', 'progress-bar');
            qPgs.attr('style', 'width: 100%;');
            qPgs.text('100%');
        },
        updateError: (msg) => {
            qArea.attr('class', 'alert alert-danger');
            qArea.find('.badge').text(msg);
            qPgs.attr('class', 'progress-bar bg-danger');
            qPgs.text('100%');
        }
    };
    let lastTime = -1;
    let lastSize = -1;
    let duration = -1;
    let tranSize = -1;

    let data = new FormData();
    data.append('uploadFile', file);

    $.ajax({
        url: '/upload',
        method: 'post',
        data: data,
        cache: false,
        processData: false,
        contentType: false,
        dataType: 'json',
        success: (msg) => {
            if(msg.code == 0){
                taskObj.updateSuccess();
            }else{
                taskObj.updateError(msg.message);
            }
        },
        error: (jqXHR, a, b) => {
            taskObj.updateError('' + a + b);
        },
        xhr: () => {
            let myXHR = $.ajaxSettings.xhr();
            if(myXHR.upload){
                myXHR.upload.addEventListener('progress', (evt) => {
                    let curTime = (new Date()).getTime();
                    if(lastTime != -1){
                        duration = curTime - lastTime;
                    }else{
                        duration = -1;
                    }
                    lastTime = curTime;

                    if(evt.lengthComputable){
                        if(lastSize != -1){
                            tranSize = evt.loaded;
                        }else{
                            tranSize = -1;
                        }
                        lastSize = evt.loaded;

                        let pct = parseInt(evt.loaded / evt.total * 100);
                        let spd = -1;
                        if(duration != -1 && tranSize != -1){
                            spd = (tranSize / duration).toFixed(0);
                        }
                        taskObj.updateSpeed(pct, spd);
                    }
                });
            }
            return myXHR;
        }
    });
}

module.exports = {
    ls : ls,
    filter: () => true,
    SetFilter: SetFilter,
    SetSorter: SetSorterEvt,
    sortby: sortByName,
    AddUploadTask: AddUploadTask
}