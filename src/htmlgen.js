'use strict';

function HTMLTag(name, attr = {}, subNodes = []) {
    return () => {

        let attrStr = '';

        if (attr) {
            let arr = []
            for (let key in attr) {
                if(attr[key])
                    arr.push(`${key}="${attr[key]}"`);
                else
                    arr.push(key);
            }
            attrStr = arr.join(" ");
        }

        let subStr = '';
        if(subNodes){
            subNodes.forEach((e) => subStr += e());
        }
        
        return `<${name} ${attrStr}>${subStr}</${name}>`;
    }
}

function text(t) {
    return () =>  t;
}

function Tag(name){
    return (attr={}, arr=[]) => HTMLTag(name, attr, arr);
}

const div = Tag('div');
const tr = Tag('tr');
const th = Tag('th');
const td = Tag('td');
const a = Tag('a');
const form = Tag('form');
const h5 = Tag('h5');
const h6 = Tag('h6')
const span = Tag('span');
const strong = Tag('strong');

function getIcon(fileInfo){
    return text(fileInfo.name.substring(fileInfo.name.lastIndexOf('.')+1).toUpperCase());
}

function prettySize(size){
    const unit = ['B', 'K', 'M', 'G', 'T'];
    let i = 0;
    while(size >= 1024 && i < unit.length-1){
        size /= 1024;
        i++;
    }
    if(size >= 100 && i < unit.length-1){
        size /= 1024;
        i++;
    }
    return `${size.toFixed(1)} ${unit[i]}`;
}

function fmtTime(time){
    let date = new Date();
    date.setTime(time);
    return `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()} ${date.getFullYear()}/${date.getMonth()+1}/${date.getDate()}`;
}

function fileTableRow(idx, fileInfo){
    return tr({}, [
        th({}, [text(idx)]),
        td({}, [getIcon(fileInfo)]),
        td({}, [a({href: `/download/${fileInfo.name}`}, [text(fileInfo.name)])]),
        td({}, [text(prettySize(fileInfo.size))]),
        td({}, [text(fmtTime(fileInfo.time))])
    ])();
}

function FileTableRows(fileArr){
    let buf = '';
    fileArr.forEach((info, idx) => {
        buf += fileTableRow(idx+1, info);
    })
    return buf;
}

function UploadArea(filename){
    return div({class: 'alert alert-warning', 'data-upload-area':null}, [
        div({class: 'd-flex align-items-center'}, [
            strong({class: 'text-truncate d-flex-inline-block', style: 'max-width: 70%;'}, [text(filename)]),
            span({class: 'badge badge-info ml-3'}, [text('Uploading')])
        ]),
        div({class:'progress'}, [
            div({class: 'progress-bar progress-bar-striped progress-bar-animated'}, [text('0% 0 m/s')])
        ])
    ])();
}

module.exports = {
    FileTableRows: FileTableRows,
    UploadArea: UploadArea
}