/**
 ** Copyright (C) 2015 fargie_s
 **
 ** This software is provided 'as-is', without any express or implied
 ** warranty.  In no event will the authors be held liable for any damages
 ** arising from the use of this software.
 **
 ** Permission is granted to anyone to use this software for any purpose,
 ** including commercial applications, and to alter it and redistribute it
 ** freely, subject to the following restrictions:
 **
 ** 1. The origin of this software must not be misrepresented; you must not
 **    claim that you wrote the original software. If you use this software
 **    in a product, an acknowledgment in the product documentation would be
 **    appreciated but is not required.
 ** 2. Altered source versions must be plainly marked as such, and must not be
 **    misrepresented as being the original software.
 ** 3. This notice may not be removed or altered from any source distribution.
 **
 **
 **
 **        Created on: 11/30/2015
 **   Original Author: fargie_s
 **
 **/

#ifndef HTTPCODES_HPP
#define HTTPCODES_HPP

/* success */
#define HTTP_OK       200
#define HTTP_CREATED  201
#define HTTP_ACCEPTED 202
#define HTTP_NON_AUTHORITATIVE 203
#define HTTP_NO_CONTENT 204
#define HTTP_RESET_CONTENT 205
#define HTTP_PARTIAL_CONTENT 206
#define HTTP_MULTI_STATUS 207
#define HTTP_CONTENT_DIFFER 210
#define HTTP_DELTA 226

/* redirect */
#define HTTP_MULTI_CHOICES 300
#define HTTP_MOVED 301
#define HTTP_TEMP_MOVED 302
#define HTTP_SEE_OTHER 303
#define HTTP_NOT_MODIFIED 304
#define HTTP_USE_PROXY 305
#define HTTP_DEPRECATED_RFC2616 306
#define HTTP_TEMP_REDIRECT 307
#define HTTP_REDIRECT 308
#define HTTP_TOO_MANY_REDIRECT 310

/* client errors */
#define HTTP_BAD_REQUEST 400
#define HTTP_UNAUTHORIZED 401
#define HTTP_PAYMENT_REQUIRED 402
#define HTTP_FORBIDEN 403
#define HTTP_NOTFOUND 404
#define HTTP_NOT_PERMITED 405
#define HTTP_NOT_ACCEPTABLE 406
#define HTTP_PROXY_AUTH_REQUIRED 407
#define HTTP_REQUEST_TIMEOUT 408
#define HTTP_CONFLICT 409
#define HTTP_GONE 410
#define HTTP_LENGTH_REQUIRED 411
#define HTTP_PRECOND_FAILED 412
#define HTTP_ENTITY_TOO_LARGE 413
#define HTTP_URI_TOO_LONG 414
#define HTTP_UNSUPPORTED_MEDIA 415
#define HTTP_REQUEST_RANGE_ERROR 416
#define HTTP_EXPECTATION_FAILED 417
#define HTTP_TEAPOT 418
#define HTTP_UNPROCESSABLE_ENTITY 422
#define HTTP_LOCKED 423
#define HTTP_METHOD_FAILURE 424
#define HTTP_UNORDERED_COLLECTION 425
#define HTTP_UPGRADE_REQUIRED 426
#define HTTP_PRECOND_REQUIRED 428
#define HTTP_TOO_MANY_REQUEST 429
#define HTTP_HEADER_TOO_LARGE 431
#define HTTP_RETRY_WITH 449
#define HTTP_PARENTAL 450
#define HTTP_ILLEGAL 451
#define HTTP_UNRECOVERABLE_ERROR 456
#define HTTP_CONN_CLOSED 499

/* server errors */
#define HTTP_INTERNAL_ERROR 500
#define HTTP_NOT_IMPLEMENTED 501
#define HTTP_BAD_GATEWAY 502
#define HTTP_SERVICE_UNAVAIL 503
#define HTTP_GATEWAY_TIMEOUT 504
#define HTTP_UNSUPPORTED_VERSION 505
#define HTTP_VERIANT_NEGOCIATE 506
#define HTTP_INSUFFICIENT_STORAGE 507
#define HTTP_LOOP_DETECTED 508
#define HTTP_BANDWIDTH_EXCEEDED 509
#define HTTP_NOT_EXTENDED 510
#define HTTP_NET_AUTH_REQUIRED 511
#define HTTP_UNKNOWN_ERROR 520

#endif // HTTPCODES_HPP

