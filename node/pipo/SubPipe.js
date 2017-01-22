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
** Created on: 2016-11-04T22:17:16+01:00
**     Author: Sylvain Fargier <fargie_s> <fargier.sylvain@free.fr>
**
*/

const
  _ = require('lodash'),
  PipeElement = require('./PipeElement'),
  Registry = require('./Registry'),
  debug = require('debug')('pipo:sub');

class SubPipe extends PipeElement {
  constructor() {
    super();
    this.pipe = [];
  }

  setPipe(subPipe) {
    var elts = subPipe.split('|');
    _.result(_.last(this.pipe), 'removeAllListeners');
    this.pipe = [];

    var last;
    for (var i in elts) {
      let Elt = Registry.pipes[elts[i]];
      if (!Elt) {
        this.error(`Failed to parse element: ${Elt}`);
        return;
      }
      let elt = new Elt();
      if (last) {
        last.next(elt);
      }
      this.pipe.push(elt);
      last = elt;
    }
    if (last) {
      last.on('item', (item) => { this.emit('item', item); });
      last.on('end', (status) => { this.emit('end', status); });
    }
    if (debug.enabled) {
      debug('new subPipe: ' + _.map(this.pipe, function(elt) {
        return _.get(elt, 'constructor.name'); }).join('|'));
    }
  }

  onItem(item) {
    if ('pipe' in item) {
      this.setPipe(item.pipe);
      delete item.pipe; // consume it
      if (_.isEmpty(item)) {
        return;
      }
    }
    var first = this.pipe[0];
    if (first) {
      first.onItem(item);
    }
  }

  end(status) {
    var first = this.pipe[0];
    if (first) {
      first.end(status);
    }
  }
}

Registry.add('SubPipe', SubPipe);

module.exports = SubPipe;
