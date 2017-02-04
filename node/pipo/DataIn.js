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
** Created on: 2016-11-01T18:24:40+01:00
**     Author: Sylvain Fargier <fargie_s> <fargier.sylvain@free.fr>
**
*/

const debug = require('debug')('pipo:in');

const PipeElement = require('./PipeElement');

module.exports = class DataIn extends PipeElement {
  constructor(bufSize) {
    if (!bufSize) {
      bufSize = 2048;
    }

    super();
    this.buffer = Buffer.allocUnsafe(2048);
    this.sz = 0;
  }
  add(buffer) {
    if (this._append(buffer)) {
      this._parse();
    }
  }
  _append(buffer) {
    var inString = false;
    var ret = false;
    for (var i = 0; i < buffer.length; ++i) {
      var c = buffer[i];
      /*                      ' '           '\t'        '\n' */
      if (!inString && (c === 0x20 || c === 0x09 || c === 0x0A)) {
        continue;
      }
      ret = true;
      if (this.sz >= this.buffer.length) {
        this._resize();
      }
      this.buffer[this.sz++] = c;
      if (c === 0x5C /* '\\' */) {
        if (this.sz >= this.buffer.length) {
          this._resize();
        }
        this.buffer[this.sz++] = buffer[++i];
      } else if (c === 0x22 /* '"' */) {
        inString = !inString;
      }
    }
    return ret;
  }
  _resize() {
    var old = this.buffer;
    this.buffer = Buffer.alloc(this.buffer.length * 2);
    old.copy(this.buffer, 0, 0, this.sz);
  }
  _parse() {
    var pos = 0;

    while (true)
    {
      var blockStart = null;
      var blockEnd = null;
      while (!blockStart) {
        if (pos >= this.sz) {
          this.sz = 0;
          return;
        }
        let c = String.fromCharCode(this.buffer[pos++]);
        if (c === '{') {
          blockStart = '{';
          blockEnd = '}';
        }  else if (c === '[') {
          blockStart = '[';
          blockEnd = ']';
        }
      }
      var start = pos - 1;

      var depth;
      var inString = false;
      for (depth = 1; depth > 0 && pos <= this.sz; ) {
        let c = String.fromCharCode(this.buffer[pos++]);
        if (c === '\\') {
          ++pos;
        } else if (c === '"') {
          inString = !inString;
        } else if (!inString) {
          if (c === blockStart) {
            ++depth;
          } else if (c === blockEnd) {
            --depth;
          }
        }
      }
      if (depth === 0) {
        var ret = this.buffer.slice(start, pos++);
        try {
          ret = JSON.parse(ret.toString());
          debug('new item: ' + JSON.stringify(ret));
          this.emit('item', ret);
        }
        catch (err)
        {

        }
      } else {
        if (start !== 0) {
          this.buffer.copy(this.buffer, 0, start, this.sz - start);
          this.sz -= start;
        }
        return;
      }
    }
  }
};
