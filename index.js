const resolveSuccess = (id, result, callback) => {
    callback(200, {
        jobRunID: id,
        data: result,
        statusCode: 200
    });
};

const resolveError = (id, error, callback) => {
    console.log("Error:", error)
    callback(500, {
        jobRunID: id,
        status: "errored",
        error: error.message,
        statusCode: 500
    });
};

const createRequest = (input, callback) => {
    const endpoint = input.endpoint;
    switch (endpoint.toLowerCase()) {
        case "ordinals/collections":
            const getRequestPath = '/api/v5/mktplace/nft/ordinals/collections';
            const getParams = {
                ...input.data
            };
            sendGetRequest(getRequestPath, getParams, input, callback);
            break;
        case "chain/supported-chains":
            const postRequestPath = '/api/v5/waas/wallet/chain/supported-chains';
            const postParams = {
                ...input.data
            };
            sendPostRequest(postRequestPath, postParams, input, callback);
            break;
        default:
            break;
    }
};

require('dotenv').config()
const https = require('https');
const crypto = require('crypto');
const querystring = require('querystring');

// 定义 API 凭证和项目 ID
const api_config = {
    "api_key": process.env.api_key,
    "secret_key": process.env.secret_key,
    "passphrase": process.env.passphrase,
    "project": process.env.project // 此处仅适用于 WaaS APIs
};
const HTTP_API = "www.okx.com";

function preHash(timestamp, method, request_path, params) {
    // 根据字符串和参数创建预签名
    let query_string = '';
    if (method === 'GET' && params) {
        query_string = '?' + querystring.stringify(params);
    }
    if (method === 'POST' && params) {
        query_string = JSON.stringify(params);
    }
    return timestamp + method + request_path + query_string;
}

function sign(message, secret_key) {
    // 使用 HMAC-SHA256 对预签名字符串进行签名
    const hmac = crypto.createHmac('sha256', secret_key);
    hmac.update(message);
    return hmac.digest('base64');
}

function createSignature(method, request_path, params) {
    // 获取 ISO 8601 格式时间戳
    const timestamp = new Date().toISOString().slice(0, -5) + 'Z';
    // 生成签名
    const message = preHash(timestamp, method, request_path, params);
    const signature = sign(message, api_config['secret_key']);
    return { signature, timestamp };
}

function sendGetRequest(request_path, params, input, callback) {
    // 生成签名
    const { signature, timestamp } = createSignature("GET", request_path, params);

    // 生成请求头
    const headers = {
        'OK-ACCESS-KEY': api_config['api_key'],
        'OK-ACCESS-SIGN': signature,
        'OK-ACCESS-TIMESTAMP': timestamp,
        'OK-ACCESS-PASSPHRASE': api_config['passphrase'],
        'OK-ACCESS-PROJECT': api_config['project'] // 这仅适用于 WaaS APIs
    };

    const options = {
        hostname: HTTP_API,
        path: request_path + (params ? `?${querystring.stringify(params)}` : ''),
        method: 'GET',
        headers: headers
    };

    const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        res.on('end', () => {
            resolveSuccess(input.id, JSON.parse(data), callback)
        });
        res.on('error', error => {
            resolveError(input.id, JSON.parse(error), callback);
        });
    });

    req.end();
}

function sendPostRequest(request_path, params, input, callback) {
    // 生成签名
    const { signature, timestamp } = createSignature("POST", request_path, params);

    // 生成请求头
    const headers = {
        'OK-ACCESS-KEY': api_config['api_key'],
        'OK-ACCESS-SIGN': signature,
        'OK-ACCESS-TIMESTAMP': timestamp,
        'OK-ACCESS-PASSPHRASE': api_config['passphrase'],
        'OK-ACCESS-PROJECT': api_config['project'], // 这仅适用于 WaaS APIs
        'Content-Type': 'application/json' // POST 请求需要加上这个头部
    };

    const options = {
        hostname: HTTP_API,
        path: request_path,
        method: 'POST',
        headers: headers
    };

    const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        res.on('end', () => {
            resolveSuccess(input.id, JSON.parse(data), callback)
        });
        res.on('error', error => {
            resolveError(input.id, JSON.parse(error), callback);
        });
    });

    if (params) {
        req.write(JSON.stringify(params));
    }

    req.end();
}

exports.handler = (event, context, callback) => {
    createRequest(event, (statusCode, data) => {
        callback(null, data);
    });
};

exports.handlerv2 = (event, context, callback) => {
    createRequest(JSON.parse(event.body), (statusCode, data) => {
        callback(null, {
            statusCode: statusCode,
            body: JSON.stringify(data),
            isBase64Encoded: false
        });
    });
};

module.exports.createRequest = createRequest;
