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
** Created on: 2016-11-04T21:49:04+01:00
**     Author: Sylvain Fargier <fargie_s> <fargier.sylvain@free.fr>
**
*/

const
  _ = require('lodash'),
  PipeElement = require('./PipeElement');

require('colors');

/**
 * @module StdOut
 * @description prints items on the console
 *
 * A special mode is used when displaying on the console:
 * - items that fits in less the 80 columns when indent=0 will be displayed as such
 * - items are colorized
 *
 * ### Configuration
 * | Name         | Type    | Default | Description            |
 * | :----------- | :------ | :------ | :--------------------- |
 * | [`indent`]   | integer | 2       | The indentation |
 * | [`eol`]      | boolean | true    | Add \n after each item |
 * | [`noConfig`] | boolean | true    | Do not print config properties |
 *
 * ### Items
 * See [Lodash](https://lodash.com/docs/4.17.4#get) for details about *path*.
 *
 * @example
 * // StdOut is part of the default pipe (Stdin|SubPipe|StdOut), so we don't
 * // need to define it.
 * {
 *   "StdOutConfig": { "indent": 0 }
 * }
 * {
 *   "test": 42,
 *   "titi": 44
 * }
 * ===
 * {"test":42,"titi":44}
 */
class StdOut extends PipeElement {
  constructor(fd, indent) {
    super();
    this._fd = _.defaultTo(fd, process.stdout);
    if (this._fd.isTTY) {
      this._fd = new Colorify(this._fd);
    }
    else {
      this._fd.dump = (item) => {
        this._fd.write(JSON.stringify(item, null, this.indent));
      };
    }
    this.indent = _.defaultTo(indent, 2);
    this.eol = true;
    this.noConfig = true;
  }

  setNoConfig(state) {
    this.noConfig = state;
    this._opts = { noSeparateConfig: !state };
  }

  onItem(item) {
    super.onItem(item);

    if (!_.isEmpty(item)) {
      this._fd.dump(item, this.indent);
      if (this.eol) {
        this._fd.write("\n");
      }
      this.emit('item', item);
    }
  }
}

class Colorify {
  constructor(fd) {
    this._fd = fd;
  }

  write(arg) {
    this._fd.write(arg);
  }

  dump(item, indent) {
    this.stringify(item, (this.minSize(item) >= 80) ? indent : 0);
  }

  minSize(obj) { // eslint-disable-line complexity
    if (obj === undefined || typeof obj === 'function') {
      return 0;
    }
    else if (typeof obj === 'string') {
      return obj.length + 2;
    }
    else if (typeof obj === 'number') {
      return ('' + obj).length;
    }
    else if (typeof obj === 'boolean') {
      return obj ? 4 : 5;
    }
    else if (obj === null) {
      return 4;
    }
    var sz = 2;
    if (obj.length === undefined) {
      var keys = Object.keys(obj);
      keys.forEach((key, i) => {
        sz += 3 + key.length + this.minSize(obj[key]);
        if (i !== keys.length - 1) {
          sz += 1;
        }
      });
    } else {
      obj.forEach((subObj, i) => {
        sz += this.minSize(subObj);
        if (i !== obj.length - 1) {
          sz += 1;
        }
      });
    }
    return sz;
  }

  stringify(obj, indent) {
    indent = _.defaultTo(indent, 0);
    this._stringify(obj, ' '.repeat(indent), '');
  }

  _stringify(obj, indent, level) { // eslint-disable-line complexity
    if (obj === undefined || obj === 'function') {
      return;
    }
    else if (typeof obj === 'string') {
      this._fd.write(Colorify.dblQuote);
      this._fd.write(obj.magenta);
      this._fd.write(Colorify.dblQuote);
    }
    else if (typeof obj === 'number') {
      this._fd.write(('' + obj).cyan);
    }
    else if (typeof obj === 'boolean') {
      this._fd.write((obj ? Colorify.true : Colorify.false));
    }
    else if (obj === null) {
      this._fd.write(Colorify.null);
    }
    else if (obj.length === undefined) {
      this._objStr(obj, indent, level);
    } else {
      this._arrayStr(obj, indent, level);
    }
  }

  _objStr(obj, indent, level) {
    this._fd.write(Colorify.objStart);
    if (!_.isEmpty(indent)) {
      this._fd.write('\n');
    }
    const subLevel = level + indent;
    var keys = Object.keys(obj);
    keys.forEach((key, i) => {
      this._fd.write(subLevel);
      this._fd.write(Colorify.dblQuote);
      this._fd.write(key.magenta);
      this._fd.write(Colorify.dblQuote);
      this._fd.write(Colorify.colon);
      if (!_.isEmpty(indent)) {
        this._fd.write(' ');
      }
      this._stringify(obj[key], indent, subLevel);
      if (i !== keys.length - 1) {
        this._fd.write(Colorify.separator);
      }
      if (!_.isEmpty(indent)) {
        this._fd.write('\n');
      }
    });

    this._fd.write(level);
    this._fd.write(Colorify.objEnd);
  }

  _arrayStr(obj, indent, level) {
    this._fd.write(Colorify.arrayStart);
    if (!_.isEmpty(indent)) {
      this._fd.write('\n');
    }
    const subLevel = level + indent;
    obj.forEach((subObj, i) => {
      this._fd.write(subLevel);
      this._stringify(subObj, indent, subLevel);
      if (i !== obj.length - 1) {
        this._fd.write(Colorify.separator);
      }
      if (!_.isEmpty(indent)) {
        this._fd.write('\n');
      }
    });

    this._fd.write(level);
    this._fd.write(Colorify.arrayEnd);
  }
}
_.assign(Colorify, {
  dblQuote: '"'.grey.dim,
  null: 'null'.blue,
  true: 'true'.red,
  false: 'false'.red,
  arrayStart: '['.grey.dim,
  arrayEnd: ']'.grey.dim,
  objStart: '{'.grey.dim,
  objEnd: '}'.grey.dim,
  separator: ','.grey.dim,
  colon: ':'.grey.dim
});

StdOut.Colorify = Colorify;

module.exports = StdOut;
