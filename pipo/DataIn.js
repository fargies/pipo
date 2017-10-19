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

const
  debug = require('debug')('pipo:in'),
  _ = require('lodash'),
  PipeElement = require('./PipeElement');

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
      /*                            ' '  '\t'  '\n' */
      if (!inString && _.includes([ 0x20, 0x09, 0x0A ], c)) {
        continue;
      }
      ret = true;
      this._resize();
      this.buffer[this.sz++] = c;
      if (c === 0x5C /* '\\' */) {
        this._resize();
        this.buffer[this.sz++] = buffer[++i];
      } else if (c === 0x22 /* '"' */) {
        inString = !inString;
      }
    }
    return ret;
  }
  _resize() {
    if (this.sz >= this.buffer.length) {
      var old = this.buffer;
      this.buffer = Buffer.alloc(this.buffer.length * 2);
      old.copy(this.buffer, 0, 0, this.sz);
    }
  }

  _findBlock(ctx) {
    while (!ctx.blockStart) {
      if (ctx.pos >= this.sz) {
        return false;
      }
      let c = String.fromCharCode(this.buffer[ctx.pos++]);
      if (c === '{') {
        ctx.blockStart = '{';
        ctx.blockEnd = '}';
      }  else if (c === '[') {
        ctx.blockStart = '[';
        ctx.blockEnd = ']';
      }
    }
    ctx.start = ctx.pos - 1;
    return true;
  }
  _findItem(ctx) {
    var depth;
    var inString = false;
    for (depth = 1; depth > 0 && ctx.pos <= this.sz; ) {
      let c = String.fromCharCode(this.buffer[ctx.pos++]);
      if (c === '\\') {
        ++ctx.pos;
      } else if (c === '"') {
        inString = !inString;
      } else if (!inString && (c === ctx.blockStart)) {
          ++depth;
      } else if (!inString && (c === ctx.blockEnd)) {
          --depth;
      }
    }
    return depth === 0;
  }

  _parse() {
    var ctx = { pos: 0, start: 0 };
    var rem = true;

    while (rem && (this.sz !== 0))
    {
      ctx.blockStart = ctx.blockEnd = null;
      if (!this._findBlock(ctx)) {
        this.sz = 0;
      }
      else if (this._findItem(ctx)) {
        var ret = this.buffer.slice(ctx.start, ctx.pos);
        try {
          ret = JSON.parse(ret.toString());
          debug('new item: ' + JSON.stringify(ret));
          this.emit('item', ret);
        }
        catch (err)
        {
          this.error(err);
        }
      }
      else {
        if (ctx.start !== 0) {
          this.buffer.copy(this.buffer, 0, ctx.start, this.sz - ctx.start);
          this.sz -= ctx.start;
        }
        rem = false;
      }
    }
  }
};
