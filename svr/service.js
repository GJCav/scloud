'use strict';

const Path = require('path');
const FS = require('fs');
const { homepath } = require('./util');

function listDir(dirpath){
    try{

        let rst = {
            code: 0,
            error: "none",
            files: []
        };
        const list = FS.readdirSync(dirpath, {withFileTypes:true});
        for(let fd of list){
            if(fd.isFile()){
                let filepath =  Path.resolve(dirpath, fd.name);
                let stat = FS.statSync(filepath);
                rst.files.push({
                    name: fd.name,
                    size: stat.size,
                    time: stat.atimeMs
                });
            }
        }
        return rst;

    }catch(e){
        console.error('error at listDir: ' + e.message);

        return {
            code: 1,
            error: e.message,
            files: []
        }
    }
}

function downloadFile(req, res){
    let name = req.params.filename;
    let path = Path.resolve(homepath, name);

    res.download(path);
}

function upload(req, res){
    let fileInfo = req.file;
    let tmpFilePath = fileInfo.path;
    let dstPath = Path.resolve(
        homepath, fileInfo.originalname
    );
    if(FS.existsSync(dstPath)){
        res.json({
            code: 2,
            message: 'file existed.'
        });
        FS.unlink(tmpFilePath, () => {});
        return;
    }
    /*
    FS.rename(tmpFilePath, dstPath, (err) => {
        if(err){
            res.json({
                code: 1,
                message: err.message,
                error: err
            });
        }else{
            res.json({
                code: 0,
                message: 'success'
            });
        }
    });
    */
    try{
        FS.createReadStream(tmpFilePath).pipe(FS.createWriteStream(dstPath));
        res.json({
            code: 0,
            message: 'success'
        });
    }catch(err){
        res.json({
            code: 1,
            message: err.message,
            error: err
        });
    }
    FS.unlink(tmpFilePath, () => {});
}

module.exports = {
    listDir: listDir,
    downloadFile: downloadFile,
    uploadFile: upload
}

