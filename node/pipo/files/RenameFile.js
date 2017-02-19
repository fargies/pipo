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
** Created on: 2017-02-04T14:47:51+01:00
**     Author: Fargier Sylvain <fargie_s> <fargier.sylvain@free.fr>
*/

const
  _ = require('lodash'),
  fs = require('fs'),
  PipeElement = require('../PipeElement'),
  debug = require('debug')('pipo:files');

class RenameFile extends PipeElement {
  onItem(item) {
    super.onItem(item);

    if (_.has(item, 'file') && (_.has(item, 'dest'))) {

      debug(`renaming file "${item.file}" as "${item.dest}"`);
      if (item.file !== item.dest) {
        this.ref();
        fs.rename(item.file, item.dest, (err) => {
          if (err) {
            this.error(err);
          }
          this.unref();
        });
      }
      item.file = item.dest;
      delete item.dest;
    }

    if (!_.isEmpty(item)) {
      this.emit('item', item);
    }
  }
}

module.exports = RenameFile;
