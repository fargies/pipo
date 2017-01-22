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
** Created on: 2016-12-11T18:09:34+01:00
**     Author: Sylvain Fargier <fargie_s> <fargier.sylvain@free.fr>
**
*/

const
  _ = require('lodash'),
  mstch = require('mustache'),
  fs = require('fs'),
  debug = require('debug')('pipo:out'),
  PipeElement = require('../PipeElement'),
  Registry = require('../Registry');

class Mustache extends PipeElement {
  constructor() {
    super();
    this.mustacheFile = null;
    this.mustacheTemplate = null;
    this.outFile = null;
  }

  onItem(item) {
    super.onItem(item);

    _.forIn(item.mustacheVars, function(value) {
      item[value] = mstch.render(item[value], item);
    });
    delete item.mustacheVars;

    let mstchFile = _.defaultTo(item['mustacheFile'], this.mustacheFile);
    let mstchTpl = _.defaultTo(item['mustacheTemplate'], this.mustacheTemplate);
    delete item.mustacheFile;
    delete item.mustacheTemplate;

    if (mstchFile) {
      fs.readFile(mstchFile, (err, data) => {
        if (err) {
          this.error(`failed to open moustache template file ${mstchFile}: ${err}`);
        } else {
          this._mstchOut(data.toString(), item);
        }
        if (!_.isEmpty(item)) {
          this.emit('item', item);
        }
      });
    } else {
      if (mstchTpl) {
        this._mstchOut(mstchTpl, item);
      }
      if (!_.isEmpty(item)) {
        this.emit('item', item);
      }
    }
  }

  _mstchOut(tpl, item) {
    let outFile = _.defaultTo(item.mustacheOutFile, this.outFile);
    let data = mstch.render(tpl, item);
    delete item.mustacheOutFile;

    if (_.isEmpty(outFile)) {
      item.mustacheOut = data;
    } else {
      fs.writeFile(outFile, data, (err) => {
        this.error(`failed to open moustache out file ${outFile}: ${err}`);
      });
    }
  }
}

Registry.add('Mustache', Mustache);

module.exports = Mustache;
