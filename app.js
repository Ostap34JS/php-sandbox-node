var express = require('express');
var app = express();
var fs = require('fs');
const {exec} = require('child_process');
const uuidv1 = require('uuid/v1');

var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({extended: true})); // support encoded bodies

app.get('/', function (req, res) {
    res.sendFile("index.html", {root: __dirname});
});

app.post('/compile', function (req, res) {
    let code = req.body.code;

    //create dir
    let dir = tmpDir();
    console.log('folder created')
    //create file
    fs.writeFile(dir + '/file.php', code, function (err) {
        if (err) throw err;
        //run docker
        let command = `docker run --rm -v $(pwd):/app -w /app php:cli php ${dir}/file.php`;
        console.log(command)
        exec(command, (err, stdout, stderr) => {
            res.json({
                "output": stdout
            });
            //delete file and folder
            fs.unlinkSync(dir + "/file.php");
            fs.rmdirSync(dir)
            console.log('folder removed')
        });
    });
});

app.listen(3000, function () {
    console.log('app listening on port 3000!');
});

function tmpDir() {
    var dir = 'temp/' + uuidv1();

    fs.mkdir(dir, {recursive: true}, (err) => {
        if (err) throw err;
    });

    return dir;
}