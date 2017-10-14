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
** Created on: 2017-02-04T14:02:48+01:00
**     Author: Fargier Sylvain <fargie_s> <fargier.sylvain@free.fr>
*/

const
  path = require('path'),
  _ = require('lodash'),
  fs = require('fs'),
  PipeElement = require('../PipeElement'),
  debug = require('debug')('pipo:files');

class ListDir extends PipeElement {
  constructor() {
    super();
    this.pattern = null;
    this.fullPath = false;
  }

  onItem(item) {
    super.onItem(item);

    if (_.has(item, 'dir')) {
      var dir = item.dir;
      debug('listing file in dir:', dir);
      this.ref();
      fs.readdir(dir, (err, files) => {
        if (err) {
          this.error(err);
        } else {
          _.forEach(files, (file) => {
            if (_.isRegExp(this.pattern) && !file.match(this.pattern)) {
              return;
            }
            if (this.fullPath) {
              file = dir + path.sep + file;
            }
            this.emit('item', { file: file });
          });
        }
        this.unref();
      });
      delete item.dir;
    }

    if (!_.isEmpty(item)) {
      this.emit('item', item);
    }
  }

  setPattern(pattern, options) {
    if (_.isEmpty(pattern)) {
      this.pattern = null;
    } else {
      try {
        this.pattern = new RegExp(pattern, options);
      }
      catch(e) {
        this.error(e);
      }
    }
  }
}

module.exports = ListDir;
