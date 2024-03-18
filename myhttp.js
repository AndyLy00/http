const net = require('net');
const process = require('process');

// Function to make HTTP request
function makeRequest(host, port, path, callback) {
    const client = net.createConnection({ host, port }, () => {
        client.write(`GET ${path} HTTP/1.1\r\nHost: ${host}\r\n\r\n`);
    });

    let responseData = '';

    client.on('data', (data) => {
        responseData += data.toString();
    });

    client.on('end', () => {
        callback(responseData);
    });

    client.on('error', (err) => {
        console.error('Error:', err);
    });
}

// Function to parse and print response
function parseResponse(response) {
    // Extracting headers and body
    const [headers, body] = response.split('\r\n\r\n');
    const statusCode = headers.split('\r\n')[0].split(' ')[1];

    if (statusCode === '200') {
        // Removing HTML tags for simplicity
        const cleanBody = body.replace(/<[^>]*>/g, '');
        console.log(cleanBody);
    } else {
        console.error('Error:', statusCode);
    }
}

// Parse command-line arguments
const args = process.argv.slice(2);
const command = args[0];
const param = args[1];

// Execute corresponding action
if (command === '-h') {
    console.log('Usage:');
    console.log('go2web -u <URL>');
    console.log('go2web -s <search-term>');
} else if (command === '-u' && param) {
    const url = new URL(param);
    makeRequest(url.hostname, 80, url.pathname, parseResponse);
} else if (command === '-s' && param) {
    // Assuming Google search for simplicity
    const searchQuery = param.replace(/\s+/g, '+');
    makeRequest('www.google.com', 80, `/search?q=${searchQuery}`, parseResponse);
} else {
    console.error('Invalid command. Use -h for help.');
}