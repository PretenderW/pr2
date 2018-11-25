const http = require('http')
const fs = require("fs");
const path = require('path');
var ip = require("ip");
const port = 3000
const log = path.join(__dirname, 'logs.txt');


const requestHandler = (request, response) => {
    let str = '';
    //console.log(request.url);
    const date = new Date();
    const url = request.url;
    const arr = url.split('/');

    str +=`Date:${date.getFullYear()}-${date.getMonth()}-${date.getDate()};\n`+
    `Time: ${date.getHours()}-${date.getMinutes()};\n`+
    `Method: ${request.method};\n`+
    `URL: ${request.url};\n`+
    `IP: ${ip.address()}\n`;
    //`IP: ${request.socket.localAddress}\n`;
    //`IP: ${request.connection.remoteAddress.split(':').slice(-1)};\n`;

    fs.appendFileSync(log, str);
    //console.log(str);
    str = '';
    let fileContent;
    let env = {};
    if (arr[1] === 'variables'){
       fileContent = fs.readFileSync(".env", "utf8");
       let n = arr.length;
       //console.log(n);
       if (n == 2){
          //console.log(fileContent);
          str += fileContent;
        }
       else {
         let tmp = fileContent.split('\n');
         //console.log(temp);
         tmp.forEach(function(element){
           let par = element.split('=');
           //console.log(par);
           env[par[0].toLowerCase()] = par[1];
         })
       }
       //console.log(env);
       for (let i = 2; i < n; i++)
        {
           //const name = arr[i].substr(1).toLowerCase();
           const name = arr[i].toLowerCase();
           const t = env[name];
           if ( t === undefined){
              str += `Value ${name} is absent\n</br>`;
            }
            else{
              //console.log(t);
              str += `Value ${name} = ${t}\n</br>`;
            }
        }
      //  console.log(str);
        response.end(str);
    }
    else{ if (arr[1] === 'files'){
            if (arr.length < 3){
              response.end(`Print file name\n</br>`);
            }
            else{
              const name = arr[2].toLowerCase();
              const ext = arr[2].split('.');
              if (ext[1]==='pdf'){
                const file = path.join(__dirname, name);
                if (fs.existsSync(file)) {
                  console.log("Load file");
                  response.writeHead(200, {"Content-Type" : "application/pdf"});
                  fs.createReadStream(file).pipe(response);
                }
                else  response.end(`File ${name} not faund\n</br>`);
              }
              else response.end(`Undefine file extension ${ext[1]}\n</br>`);
            }
        }
        else  response.end(`Undefine command - ${arr[1]}\n</br>`);
  }
}


const server = http.createServer(requestHandler)
server.listen(port, (err) => {
    if (err) {
        return console.log('something bad happened', err);
    }
    console.log(`server is listening on ${port}`);
})

process.on('exit', (code) => {
  console.log(`Exit with code: ${code}`);
  const date = new Date();
  fs.appendFileSync(log, `Date:${date.getFullYear()}-${date.getMonth()}-${date.getDate()};\n`+
`Exit with code: ${code}\n\n`);
});

process.on('SIGINT', function() {
    console.log('Signal: Ctrl+C');
    const date = new Date();
    fs.appendFileSync(log, `Date:${date.getFullYear()}-${date.getMonth()}-${date.getDate()};\n`+
    'Signal: Ctrl+C;\n');
    setTimeout(function() {
        //console.log('Exit');
        process.exit(666);
    }, 1000);
})
