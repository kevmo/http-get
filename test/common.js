'use strict';

var zlib = require('zlib');
var http = require('http');

var options = {
	host: '127.0.0.1',
	port: process.env.HTTP_REQUEST_HTTP || 42890,
	securePort: process.env.HTTP_REQUEST_HTTPS || 42891
};

exports.options = options;

/**
 * The HTTP test server response wrapper
 *
 * @param {Object} req The client request
 * @param {Object} res The server response 
 */
var Response = function (req, res) {
	this.req = req;
	this.res = res;
};

/**
 * Interprets the Accept-Encoding header, sets the proper response header
 *
 * @returns {Mixed} The encoding sent to the client
 */
Response.prototype.encoding = function () {
	if (this.req.headers['accept-encoding']) {
		var accept = this.req.headers['accept-encoding'].split(',');
		
		if (accept.indexOf('gzip') !== -1) {
			return 'gzip';
		}
		
		if (accept.indexOf('deflate') !== -1) {
			return 'deflate';
		}
	}
	
	return null;
};

/**
 * Sends the HTTP response to the client
 *
 * @param {Object} content The HTTP response
 * @param {String} content.body The HTTP response body content
 * @param {String} content.type The content MIME type
 */
Response.prototype.send = function (content) {
	if (typeof content !== 'object') {
		content = {};
	}
	
	if (typeof content.body !== 'string') {
		content.body = 'Hello World';
	}
	
	if (typeof content.type !== 'string') {
		content.type = 'text/plain';
	}
	
	if (typeof content.code !== 'number') {
		content.code = 200;
	}
	
	if (typeof content.headers === 'object') {
		var header;
		
		for (header in content.headers) {
			if (content.headers.hasOwnProperty(header)) {
				this.res.setHeader(header.toLowerCase(), content.headers[header].toLowerCase());
			}
		}
	}
	
	var self = this;
	
	switch (this.encoding()) {
		case 'gzip':
			zlib.gzip(content.body, function (err, compressed) {
				if ( ! err) {
					self.res.setHeader('content-encoding', 'gzip');
					self.res.writeHead(content.code, {'content-type': content.type});
					self.write(compressed);
				} else {
					self.res.writeHead(500, {'content-type': 'text/plain'});
				}
				self.res.end();
			});
		break;
		
		case 'deflate':
			zlib.deflate(content.body, function (err, compressed) {
				if ( ! err) {
					self.res.setHeader('content-encoding', 'deflate');
					self.res.writeHead(content.code, {'content-type': content.type});
					self.write(compressed);
				} else {
					self.res.writeHead(500, {'content-type': 'text/plain'});
				}
				self.res.end();
			});
		break;
		
		default:
			self.res.writeHead(content.code, {'content-type': content.type});
			self.write(content.body);
			self.res.end();
		break;
	}
};

/**
 * Sends the content down the pipe for HTTP methods that support this
 *
 * @param {String} body The HTTP response body content
 */
Response.prototype.write = function (body) {
	if (this.req.method !== 'HEAD') {
		this.res.write(body);
	}
};

exports.createHttpServer = function () {
	return http.createServer(function (req, res) {
		var response = new Response(req, res);
		switch (req.url) {
			case '/redirect-without-location':
				response.send({
					code: 301,
					type: 'text/plain',
					body: ''
				});
			break;
			
			default:
				response.send();
			break;
		}
	});
};