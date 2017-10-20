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
    this.ctx = { inString: false, escape: false, sz: 0, block: null, depth: 0 };
  }
  add(buffer) {
    for (var i = 0; i < buffer.length; ++i) {
      if (this._preParse(buffer[i])) {
        this._parse();
      }
    }
  }
  _preParseString(c, ctx) {
    if (ctx.escape) {
      ctx.escape = false;
    }
    else if (c === 0x5C /* \\ */) {
      ctx.escape = true;
    }
    else if (c === 0x22 /* '"' */) {
      ctx.inString = false;
    }
  }
  _preParseBlkStart(c, ctx) {
    if (c === 0x7b /* '{' */) {
      ctx.block = { start: 0x7b, end: 0x7d };
      ctx.depth = 1;
    }
    else if (c === 0x5b /* '[' */) {
      ctx.block = { start: 0x5b, end: 0x5d };
      ctx.depth = 1;
    }
  }
  _preParseBlk(c, ctx) {
    if (c === ctx.block.start) {
      ctx.depth += 1;
    }
    else if (c === ctx.block.end) {
      ctx.depth -= 1;
    }
    return ctx.depth === 0;
  }
  _preParse(c) {
    var ret = false;
    if (this.ctx.inString) {
      this._preParseString(c, this.ctx);
    }
    else if (_.includes([ 0x20, 0x09, 0x0A ], c)) {
      /* filtered out */
      return ret;
    }
    else {
      if (this.ctx.depth === 0) {
        this._preParseBlkStart(c, this.ctx);
      }
      else {
        ret = this._preParseBlk(c, this.ctx);
      }
      this.ctx.inString = (c === 0x22 /* '"' */);
    }
    this._resize();
    this.buffer[this.ctx.sz++] = c;
    return ret;
  }

  _resize() {
    if (this.sz >= this.buffer.length) {
      var old = this.buffer;
      this.buffer = Buffer.alloc(this.buffer.length * 2);
      old.copy(this.buffer, 0, 0, this.sz);
    }
  }

  _parse() {
    try {
      var ret = JSON.parse(this.buffer.slice(0, this.ctx.sz));
      debug('new item: ' + JSON.stringify(ret));
      this.emit('item', ret);
    }
    catch (err) {
      this.error(err);
    }
    this.ctx = { inString: false, escape: false, sz: 0, block: null, depth: 0 };
  }
};
