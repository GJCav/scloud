const $ = require('jquery');
const Bootstrap = require('bootstrap');
const Ctrl = require('./control');
const View = require('./htmlgen');


// file table
let files = [];

function FreshFileTable(){
    let arr = [];
    files.forEach((e) => {
        if(Ctrl.filter(e)) arr.push(e);
    })
    arr.sort(Ctrl.sortby);
    let qTable = $('#filelist');
    let qBody = qTable.children('tbody');
    qBody.empty();
    qBody.append(View.FileTableRows(arr));
}

function UpdateFileTable(){
    Ctrl.ls(
        (data) => {
            if(Boolean(data) && data.code == 0){
                files = data.files;
                FreshFileTable();
            }else{
                alert('error on loading file list.\n See the console for more information.');
                console.log({code: data.code, error: data.error});
            }
        },
        (error) => {
            alert('error on loading file list.\n See the console for more information.');
            console.log(error);
        }
    );
}

let searchField = $('#search-field');
searchField.val('');
searchField.on('input', () => {
    Ctrl.SetFilter(searchField.val());
    FreshFileTable();
});

$('[data-sort]').on('click', (e) => {
    Ctrl.SetSorter(e);
    FreshFileTable();
});

UpdateFileTable();

// upload table...

const qUpdForm = $('#upload-file').siblings('input');
const qUpdAreas = $('[data-upload-areas]');

$('#upload-file').on('click', () => {
    qUpdForm.trigger('click');
});

qUpdForm.on('change', () => {
    let files = qUpdForm.prop('files');
    for(let file of files){
        let qArea = $(View.UploadArea(file.name));
        qUpdAreas.append(qArea);
        Ctrl.AddUploadTask(file, qArea);
    }
});

$('[data-upload-area]').remove();