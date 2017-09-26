'use strict';
/*
** Copyright (C) 2016 Sylvain Fargier
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
** Created on: 2016-11-06T19:00:41+01:00
**     Author: Sylvain Fargier <fargie_s> <fargier.sylvain@free.fr>
**
*/

const
  fs = require('fs'),
  q = require('q'),
  url = require('url'),
  _ = require('lodash'),
  debug = require('debug')('pipo:html'),
  request = require('request'),
  PipeElement = require('../PipeElement');

class HTMLFetcher extends PipeElement {
  constructor() {
    super();
    this.outFile = null;
    this.proxy = null;
    this.timeout = 10000;
    this._queue = q();
  }

  onItem(item) {
    super.onItem(item);

    if ('url' in item) {
      let outFile = _.defaultTo(item.outFile, this.outFile);
      let defer = q.defer();
      let proxy = item.proxy || this.proxy;
      let options = {
        url: item.url,
        timeout: this.timeout
      };

      if (!_.isNil(proxy)) {
        options.proxy = url.parse(proxy);
        options.proxy.timeout = this.timeout;
        options.tunnel = true;
      }

      this.ref();
      this._queue = this._queue.finally(() => {
        debug(`starting request "${options.url}"`);
        if (outFile) {
          request.get(options)
          .on('error', defer.reject.bind(defer))
          .pipe(() => {
            fs.createWriteStream(outFile)
            .on('close', defer.resolve.bind(defer));
          });
        } else {
          request.get(options, (error, response, body) => {
            if (error) {
              defer.reject(error);
            } else if (response.statusCode !== 200) {
              defer.reject(`invalid reply: ${response.statusCode}`);

            } else {
              delete item.url;
              item.html = body;
              this.emit('item', item);
              defer.resolve();
            }
          });
        }
        return defer.promise;
      })
      .then(
        () => {
          debug(`request finished for "${options.url}"`);
          this.unref();
        },
        (err) => {
          debug(`request failed for "${options.url}"`);
          this.error(err);
          this.unref();
        });
    } else if (!_.isEmpty(item)) {
      this.emit('item', item);
    }
  }
}

module.exports = HTMLFetcher;
