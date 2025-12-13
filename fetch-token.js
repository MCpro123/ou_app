// netlify/functions/fetch-token.js
const https = require('https');

exports.handler = async (event, context) => {
  // Allow GET requests only
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({
        success: false,
        message: 'Method not allowed'
      })
    };
  }

  // Get headers
  const accessToken = event.headers['access-token'] || event.headers['Access-Token'];
  const phoneNumber = event.headers['phone-number'] || event.headers['Phone-Number'];

  if (!accessToken || !phoneNumber) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        success: false,
        message: 'Missing required headers: access-token and/or phone-number'
      })
    };
  }

  // Build target URL
  const query = new URLSearchParams({
    'uuid': 'd76d97c8d3351be3a26c0f5edf00131c',
    'mcuid': '58e88a766de8a4628fd62173ac0f91c2',
    'mcapp': 'myid'
  }).toString();

  const url = `https://myidgo.mytel.com.mm/?${query}`;

  // Prepare headers
  const headers = {
    'avatar': '',
    'lang': 'en',
    'phone-number': phoneNumber,
    'access-token': accessToken,
    'User-Agent': 'Mozilla/5.0 (Linux; Android 11; Redmi Note 8 Pro Build/RP1A.200720.011; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/139.0.7258.94 Mobile Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Cache-Control': 'no-cache'
  };

  return new Promise((resolve, reject) => {
    const options = {
      headers: headers,
      timeout: 20000
    };

    https.get(url, options, (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });

      response.on('end', () => {
        // Extract token using regex
        const tokenMatch = data.match(/window\.token\s*=\s*"([^"]+)"/i);
        
        if (tokenMatch && tokenMatch[1]) {
          resolve({
            statusCode: 200,
            body: JSON.stringify({
              success: true,
              token: tokenMatch[1]
            })
          });
        } else {
          resolve({
            statusCode: 200,
            body: JSON.stringify({
              success: false,
              message: 'Token not found in response'
            })
          });
        }
      });
    }).on('error', (error) => {
      resolve({
        statusCode: 502,
        body: JSON.stringify({
          success: false,
          message: 'Upstream request error: ' + error.message
        })
      });
    }).on('timeout', () => {
      resolve({
        statusCode: 504,
        body: JSON.stringify({
          success: false,
          message: 'Request timeout'
        })
      });
    });
  });
};