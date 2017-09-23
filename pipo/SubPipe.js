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
  Item = require('./Item'),
  Registry = require('./Registry'),
  debug = require('debug')('pipo:sub');

class SubPipe extends PipeElement {
  constructor(pipe) {
    super();
    this.oneShot = false;
    this.pipe = null;
    if (!_.isNil(pipe)) {
      this.setPipe(pipe);
    }
  }

  createSimplePipe(subPipe) {
    var pipe;
    if (_.isString(subPipe)) {
      var elts = subPipe.split('|');
      pipe = [];

      for (var i in elts) {
        let info = _.split(elts[i], '#');
        if (!(info[0] in Registry.pipes)) {
          this.error(`Failed to parse element: ${elts[i]}`);
          return;
        }
        let Elt = Registry.pipes[info[0]];
        let elt = new Elt();
        _.invoke(_.last(pipe), 'next', elt);
        pipe.push(elt);
        if (info[1]) {
          elt.setName(info[1]);
        }
      }
      if (_.isEmpty(pipe)) {
        this.error(`No pipe expression`);
        return;
      }
      this.ref();
      _.last(pipe)
      .on('item', (item) => { this.emit('item', item); })
      .on('end', (status) => { super.end(status); });

      if (debug.enabled) {
        debug('subPipe created: ' + _.map(pipe, 'constructor.name').join('|'));
      }
      return pipe;
    }
    else if (_.isObject(subPipe)) {
      pipe = new SubPipe();
      this.ref();
      pipe
      .on('item', (item) => { this.emit('item', item); })
      .on('end', (status) => { super.end(status); });

      pipe.onItem(subPipe);
      return [ pipe ];
    }
    else {
      this.error(`Unknown subPipe expression ${subPipe}`);
    }
  }

  createPipe(subPipe) {
    if (_.isArray(subPipe)) {
      /* only one level allowed */
      return _.compact(_.map(subPipe, this.createSimplePipe.bind(this)));
    }
    else {
      return this.createSimplePipe(subPipe);
    }
  }

  deletePipe(pipe) {
    if (!_.isArray(pipe)) {
      return;
    }
    else if (_.isArray(pipe[0])) {
      _.forEach(pipe, this.deletePipe.bind(this));
    }
    else {
      _.forEach(pipe, function(p) { p.removeAllListeners(); });
      this.unref();
    }
  }

  pipeInvoke(pipe, method, ...args) {
    if (!_.isArray(pipe)) {
      return;
    }
    else if (_.isArray(pipe[0])) {
      _.forEach(pipe, (p) => { this.pipeInvoke(p, method, ...args); });
    }
    else {
      _.invoke(pipe[0], method, ...args);
    }
  }

  setPipe(subPipe) {
    this.pipe = subPipe;

    this.deletePipe(this._pipe);
    this._pipe = null;
  }

  onItem(item) {
    super.onItem(item);
    if (_.has(item, 'pipe')) {
      this.setPipe(Item.take(item, 'pipe'));
    }

    if (_.isEmpty(item)) {
      return;
    }
    else if (_.isEmpty(this.pipe)) {
      this.emit('item', item);
    }
    else if (this.oneShot) {
      var pipe = this.createPipe(this.pipe);
      if (_.isArray(pipe)) {
        if (_.isArray(pipe[0])) {
          _.forEach(pipe, (p) => {
            _.last(p).on('end', () => { this.deletePipe(p); });
          });
        }
        else {
          _.last(pipe).on('end', () => { this.deletePipe(pipe); });
        }
      }
      this.pipeInvoke(pipe, 'onItem', item);
      this.pipeInvoke(pipe, 'end', 0);
    }
    else {
      if (_.isNil(this._pipe)) {
        this._pipe = this.createPipe(this.pipe);
      }
      this.pipeInvoke(this._pipe, 'onItem', item);
    }
  }

  end(status) {
    if (!_.isEmpty(this._pipe)) {
      this.pipeInvoke(this._pipe, 'end', status);
    }
    super.end(status);
  }
}

module.exports = SubPipe;
