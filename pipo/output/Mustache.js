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
  process = require('process'),
  debug = require('debug')('pipo:mstch'),
  PipeElement = require('../PipeElement');

class Mustache extends PipeElement {
  constructor() {
    super();
    this.mustacheVars = null;
    this.mustacheFile = null;
    this.mustacheTemplate = null;
    this.outFile = null;
  }

  onItem(item) {
    super.onItem(item);
    var config = this.takeConfig(item);
    if (config) {
      this.emit('item', config);
    }
    if (_.isEmpty(item)) {
      return;
    }

    _.forIn(item.mustacheVars || this.mustacheVars, function(value, key) {
      item[key] = mstch.render(value, item);
    });
    delete item.mustacheVars;
    debug(item);

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
    let writeFunc;

    if (_.isEmpty(data)) {
      return;
    }
    if (outFile === "stdout") {
      writeFunc = process.stdout.write.bind(process.stdout);
    } else if (outFile === "stderr") {
      writeFunc = process.stderr.write.bind(process.stderr);
    } else {
      writeFunc = fs.writeFile.bind(null, outFile);
    }

    if (_.isEmpty(outFile)) {
      item.mustacheOut = data;
    } else {
      writeFunc(data, null, (err) => {
        if (err) {
          this.error(`failed to open moustache out file ${outFile}: ${err}`);
        }
      });
    }
  }
}

module.exports = Mustache;
