// const https = require('https');
// const net = require('net');
// const { parse } = require('url');
// const { createInterface } = require('readline');
// const process = require("process");
//
// function search(term) {
//     const searchUrl = `https://ultra.md/search?search=${encodeURIComponent(term)}`;
//     makeRequest(searchUrl).then((html) => {
//         // Extract results from the HTML content
//         const pattern = /https:\/\/ultra\.md\/product\/[\w-]+?/;
//         let count = 1;
//         html.split('<a ').forEach((link) => {
//             const hrefMatch = link.match(/href="(.*?)"/);
//             const textMatch = link.match(/>(.*?)<\/a>/);
//             if (hrefMatch && textMatch) {
//                 const href = hrefMatch[1];
//                 const text = textMatch[1].trim();
//                 if (pattern.test(href) && text.length > 1 && count <= 10 && text.includes(term)) {
//                     console.log(`${count}. ${text} - ${href}`);
//                     count++;
//                 }
//             }
//         });
//     }).catch((error) => {
//         console.error('Error searching:', error);
//     });
// }
//
// function makeRequest(url) {
//     const options = parse(url);
//     return new Promise((resolve, reject) => {
//         const req = https.get(options, (res) => {
//             let data = '';
//             res.on('data', (chunk) => {
//                 data += chunk;
//             });
//             res.on('end', () => {
//                 // resolve(data.replace(/<[^>]*>/g, ''));
//                 resolve(data);
//             });
//         });
//         req.on('error', (error) => {
//             reject(error);
//         });
//     });
// }
//
// const rl = createInterface({
//     input: process.stdin,
//     output: process.stdout
// });
//
//
// const args = process.argv.slice(2);
// const command = args[0];
// const param = args.slice(1).join(' ');
// if (command === '-h' || !command) {
//     console.log('Usage:');
//     console.log('go2web -u <URL>');
//     console.log('go2web -s <search-term>');
//     rl.close();
// } else if (command === '-s' && param) {
//     search(param);
//     rl.close();
// } else if (command === '-u' && param) {
//     makeRequest(param).then((response) => {
//         console.log(response);
//         rl.close();
//     });
// } else {
//     console.error('Invalid command. Use -h for help.');
// }

const net = require('net');
const https = require('https');
const { parse: parseUrl, parse} = require('url');
const { createInterface } = require('readline');
const process = require('process');

function makeHttpRequest(url, callback) {
    const { hostname, port, path } = parseUrl(url);
    const portNumber = port || 80; // Default port for HTTP

    const client = net.createConnection({ host: hostname, port: portNumber }, () => {
        client.write(`GET ${path || '/'} HTTP/1.1\r\nHost: ${hostname}\r\nConnection: close\r\n\r\n`);
    });

    let responseData = '';

    client.on('data', (data) => {
        responseData += data.toString();
    });

    client.on('end', () => {
        responseData = responseData.replace(/<[^>]*>/g, '');
        callback(null, responseData);
        client.destroy(); // Close the connection
    });

    client.on('error', (error) => {
        callback(error, null);
    });
}
function makeRequest(url) {
    const options = parse(url);
    return new Promise((resolve, reject) => {
        const req = https.get(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                // resolve(data.replace(/<[^>]*>/g, ''));
                resolve(data);
            });
        });
        req.on('error', (error) => {
            reject(error);
        });
    });
}
function search(term) {
    const searchUrl = `https://ultra.md/search?search=${encodeURIComponent(term)}`;
    makeRequest(searchUrl).then((html) => {
        // Extract results from the HTML content
        const pattern = /https:\/\/ultra\.md\/product\/[\w-]+?/;
        let count = 1;
        html.split('<a ').forEach((link) => {
            const hrefMatch = link.match(/href="(.*?)"/);
            const textMatch = link.match(/>(.*?)<\/a>/);
            if (hrefMatch && textMatch) {
                const href = hrefMatch[1];
                const text = textMatch[1].trim();
                if (pattern.test(href) && text.length > 1 && count <= 10 && text.includes(term)) {
                    console.log(`${count}. ${text} - ${href}`);
                    count++;
                }
            }
        });
    }).catch((error) => {
        console.error('Error searching:', error);
    });
}


const rl = createInterface({
    input: process.stdin,
    output: process.stdout
});

const args = process.argv.slice(2);
const command = args[0];
const param = args.slice(1).join(' ');

if (command === '-h' || !command) {
    console.log('Usage:');
    console.log('go2web -u <URL>');
    console.log('go2web -s <search-term>');
    console.log('go2web -h               # show this help');
    rl.close();
} else if (command === '-s' && param) {
    search(param);
    rl.close();
} else if (command === '-u' && param) {
    makeHttpRequest(param, (error, response) => {
        if (error) {
            console.error('Error making HTTP request:', error);
            return;
        }
        console.log(response); // Print the HTTP response
        rl.close();
    });
} else {
    console.error('Invalid command. Use -h for help.');
}