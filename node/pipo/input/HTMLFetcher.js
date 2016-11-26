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
  _ = require('lodash'),
  request = require('request'),
  PipeElement = require('../PipeElement'),
  Registry = require('../Registry');

class HTMLFetcher extends PipeElement {
  constructor() {
    super();
    this.outFile = null;
  }

  onItem(item) {
    super.onItem(item);
    if ('url' in item) {
      let outFile = _.defaultTo(item.outFile, this.outFile);

      if (outFile) {
        request.get(item.url)
        .on('error', (error) => { this.error(error); })
        .pipe(fs.createWriteStream(outFile));
      } else {
        request.get(item.url, (error, response, body) => {
          if (error) {
            this.error(error);
          } else if (response.statusCode !== 200) {
            this.error(`invalid reply: ${response.statusCode}`);
          } else {
            this.emit('item', { html: body });
          }
        });
      }
      delete item.url;
    }
    if (!_.isEmpty(item)) {
      this.emit(item);
    }
  }
}

Registry.add('HTMLFetcher', HTMLFetcher);

module.exports = HTMLFetcher;
