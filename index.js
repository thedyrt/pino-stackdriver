const split = require('split2')
const pumpify = require('pumpify')

function pinoStackdriver (line) {
  try {
    // Parse the line into an object.
    obj = JSON.parse(line)

    // Set the severity based on the level number.
    switch (obj.level) {
      case 10: obj.severity = 'DEBUG'; break
      case 20: obj.severity = 'DEBUG'; break
      case 40: obj.severity = 'WARNING'; break
      case 50: obj.severity = 'ERROR'; break
      case 60: obj.severity = 'CRITICAL'; break
      default: obj.severity = 'INFO'
    }

    // Set time as a ISO string instead of Unix time.
    if (obj.time) {
      obj.time = new Date(obj.time).toISOString()
    }

    if (obj.req) {
      obj.httpRequest = {
        latency: obj.responseTime,
        referer: obj.req.headers && obj.req.headers.referer,
        remoteIp: obj.req.remoteAddress,
        requestMethod: obj.req.method,
        requestUrl: (obj.req.headers && obj.req.headers.host || '') + obj.req.url,
        userAgent: obj.req.headers && obj.req.headers['user-agent']
      }

      if (obj.res) { obj.httpRequest.status = obj.res.statusCode; }
    }

    // Convert the object back to a JSON string.
    return JSON.stringify(obj) + '\n'
  } catch (err) {
    return line + '\n'
  }
}

const transform = split(pinoStackdriver)

function createStream (dest = process.stdout) {
  return pumpify(transform, dest)
}

module.exports = { transform, createStream }
