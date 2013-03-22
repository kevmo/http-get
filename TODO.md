## TODO list

 * Move the unit tests to mocha + chai
 * Test 4xx errors with compressed response
 * Test 4xx errors against overflowing response document
 * Implement & test 304 handling
 * Test the error handling for a bad callback (main.head, main.get)
 * Test the proxy implementation
 * Implement & test the socket timeout
 * Test the noUserAgent implementation
 * Implement & test the debug flag
 * Remove the unices dependency in request-stream (use a cross platform implementation for the source of createReadStream)
 * Implement & test the request reissuing when the gzip / deflate encoding fails to decode
 * Test the mtime implementation
 * Test noSslVerifier
 