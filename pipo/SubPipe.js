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

/**
 * @module SubPipe
 * @description Create a new SubPipe
 *
 * ### Configuration
 * | Name       | Type                    | Default | Description         |
 * | :--------- | :---------------------- | :------ | :------------------ |
 * | `pipe`     | string, array or object | null    | The sub-pipe to create |
 * | `oneShot`  | boolean                 | false   | Run the pipe once per incoming item |
 *
 * ### Items
 * | Name       | Type                    | Description         |
 * | :--------- | :---------------------- | :------------------ |
 * | `pipe`     | string, array or object | Set pipe in configuration |
 *
 * ### Details
 *
 * *Pipe* is a '|' separated list of pipe-elements, each pipe can be named using '#<name>'.
 *
 * If *pipe* is not set incoming items are forwarded.
 *
 * If *pipe* is an array, than one sub-pipe will be created per array element,
 * each array element must be either a string or an object, arrays can't be
 * recursed.
 * Incoming items will be sent (duplicated) in each sub-pipe.
 *
 * If *pipe* is an object, then it must have a *pipe* string property,
 * additional properties will be sent to the newly created sub-pipe.
 *
 * @example
 * {
 *   "pipe": "SubPipe#test",
 *   "SubPipeConfig#test": {
 *     "pipe": "Rename"
 *   }
 * }
 * {
 *   "RenameConfig": {
 *     "property": "test",
 *     "newName": "titi"
 *   },
 *   "test": 42
 * }
 * ===
 * { "titi": 42 }
 *
 * @example
 * // Using an object pipe with embedded configuration
 * {
 *   "pipe": "SubPipe#test",
 *   "SubPipeConfig#test": {
 *     "pipe": {
 *       "pipe": "Rename",
 *       "RenameConfig": {
 *         "property": "test",
 *         "newName": "titi"
 *       }
 *     }
 *   },
 *   "test": 42
 * }
 * ===
 * { "titi": 42 }
 *
 * @example
 * // Using several oneShot sub-pipes
 * {
 *   "pipe": "SubPipe#test",
 *   "SubPipeConfig#test": {
 *     "oneShot": true,
 *     "pipe": [
 *       {
 *         "pipe": "Rename",
 *         "RenameConfig": {
 *           "property": "test",
 *           "newName": "titi"
 *         }
 *       },
 *       { "pipe": "Aggregate" }
 *     ]
 *   }
 * }
 * { "test": 42 }
 * { "toto": 42 }
 * ===
 * { "titi": 42 }
 * // When oneShot option is set, the sub-pipe is terminated once message is sent, thus aggregate is freed
 * { "items": [ { "test": 42 } ] }
 * { "toto": 42 }
 * { "items": [ { "toto": 42 } ] }
 */
class SubPipe extends PipeElement {
  constructor(pipe) {
    super();
    this.oneShot = false;
    this.pipe = null;
    this._subRef = 0;
    this._opts = { noSeparateConfig: true };
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
        let Elt = Registry.get(info[0]);
        if (_.isNil(Elt)) {
          this.error(`Failed to parse element: ${elts[i]}`);
          return;
        }
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
      _.first(pipe).ref(); /* add a ref since we don't use .next() */
      this.subRef();
      _.last(pipe)
      .on('item', this.emitItem.bind(this))
      .once('end', (status) => {
        this.subEnd(status);
        this.deletePipe(pipe);
      });

      if (debug.enabled) {
        debug('subPipe created: ' + _.map(pipe, 'constructor.name').join('|'));
      }
      return pipe;
    }
    else if (_.isObject(subPipe)) {
      pipe = new SubPipe();
      pipe.ref();
      this.subRef();
      pipe
      .on('item', this.emitItem.bind(this))
      .once('end', (status) => {
        this.subEnd(status);
        this.deletePipe(pipe);
      });

      pipe.onItem(_.cloneDeep(subPipe));
      return [ pipe ];
    }
    else {
      this.error(`Unknown subPipe expression ${subPipe}`);
    }
  }

  subRef() {
    return ++this._subRef;
  }

  subEnd(status) {
    if (--this._subRef <= 0) {
      this.end(status);
    }
  }

  createPipe(subPipe) {
    var ret;
    if (_.isArray(subPipe)) {
      /* only one level allowed */
      ret = _.compact(_.map(subPipe, this.createSimplePipe.bind(this)));
    }
    else {
      ret = this.createSimplePipe(subPipe);
    }
    if (!_.isNil(ret)) {
      this.ref();
    }
    return ret;
  }

  deletePipe(pipe) {
    if (!_.isArray(pipe)) {
      return;
    } else if (pipe === this._pipe) {
      this._pipe = null;
    }


    if (_.isArray(pipe[0])) {
      _.forEach(pipe, this.deletePipe.bind(this));
    }
    else {
      _.forEach(pipe, function(p) { p.removeAllListeners(); });
    }
  }

  pipeInvoke(pipe, method, ...args) {
    if (!_.isArray(pipe)) {
      return;
    }
    else if (_.isArray(pipe[0])) {
      _.forEach(pipe, (p) => {
        let a = _.cloneDeep(args);
        this.pipeInvoke(p, method, ...a);
      });
    }
    else {
      _.invoke(pipe[0], method, ...args);
    }
  }

  setPipe(subPipe) {
    if (subPipe !== this.pipe) {
      this.pipe = subPipe;

      if (!_.isNil(this._pipe)) {
        this.deletePipe(this._pipe);
        this.unref();
        this._subRef = 0;
      }
    }
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
    super.end(status);
    if (!_.isEmpty(this._pipe) && (this._ref === 1)) {
      this.pipeInvoke(this._pipe, 'end', status);
    }
  }
}

module.exports = SubPipe;
