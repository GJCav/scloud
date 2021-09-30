'use strict';

const express = require('express');
const Path = require('path');
const Util = require('./util');
const SVR = require('./service');
const multer = require('multer');

const upload = multer({dest: Path.resolve(__dirname, '../tmp')});

const app = express();
const port = Util.port;

app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use('/', express.static(Path.resolve(__dirname, '../dist')));

app.get('/ls', (req, res) => {
    res.json(SVR.listDir(Util.homepath));
});

app.get('/download/:filename', (req, res) => {
    SVR.downloadFile(req, res);
});

app.post('/upload', upload.single('uploadFile'), (req, res) => {
    SVR.uploadFile(req, res);
});

app.listen(port, () => {
    console.log('listening at port ' + port);
    console.log('possible IPs are: ', Util.GetMyIP().join(', '));

    console.log('home: ' + Util.homepath);
});

