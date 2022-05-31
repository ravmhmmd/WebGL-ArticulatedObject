function download(content, fileName, contentType) {
    var a = document.createElement("a");
    var file = new Blob([content], {type: contentType});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}

async function save(object) {
    let jsonData = JSON.stringify(object);
    download(jsonData, 'model.json', 'text/plain');
}

function load(file, callback) {
    console.log("test");
    if (file.type && file.type.indexOf('json') === -1) {
        console.log('File is not an JSON.', file.type, file);
        return;
    }
    const reader = new FileReader();
    reader.addEventListener('load', (event) => {
        let data = JSON.parse(atob(event.target.result.toString().match(/(?<=base64,).*/).toString()));
        callback(data);
    });
    reader.readAsDataURL(file);
};