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
** Created on: 2017-11-08T11:43:55+01:00
**     Author: Sylvain Fargier <fargie_s> <fargier.sylvain@free.fr>
**
*/

const
  EventEmitter = require('events'),
  debug = require('debug')('pipo:inspect'),
  _ = require('lodash'),

  SubPipe = require('../SubPipe');

var PipeElement = require('../PipeElement');

var _uid = 0;

class EltInspect extends EventEmitter {
  constructor(elt, pipeInspect) {
    super();
    this.id = pipeInspect.uid(elt);
    this.elt = elt;
    this.next = [];
    this.sub = [];

    this._wrap(elt, pipeInspect);

    /* track events */
    elt.on('item', this.emit.bind(this, 'item'));
    elt.once('end', this.emit.bind(this, 'end'));
  }

  _wrap(elt, pipeInspect) {
    /* add hooks */
    elt.next = _.wrap(elt.next, (next, cb) => {
      var ret = next.call(elt, cb);
      if (cb instanceof PipeElement) {
        var cbElt = pipeInspect.get(cb);
        if (_.isNil(cbElt)) {
          debug('Untracked next element !');
        }
        else {
          this.next.push(cbElt.id);
          this.emit('next', cbElt);
        }
      }
      return ret;
    });

    elt.onItem = _.wrap(elt.onItem, (onItem, item) => {
      this.emit('onItem', item);
      return onItem.call(elt, item);
    });
    if (elt instanceof SubPipe) {
      this._wrapSub(elt, pipeInspect);
    }
  }

  _wrapSub(elt, pipeInspect) {
    elt.createSimplePipe = _.wrap(elt.createSimplePipe,
      (create, ...args) => {
        var ret = create.apply(elt, args);
        if (!_.isNil(ret)) {
          var sub = pipeInspect.get(_.first(ret));
          if (_.isNil(sub)) {
            debug('Untracked sub-pipe element !');
          }
          else {
            this.sub.push(sub.id);
            this.emit('sub', sub);
          }
        }
        return ret;
      }
    );
  }

}

class PipeInspect extends EventEmitter {
  constructor() {
    super();
    this._cb = null;
    this.elements = {};
    this.links = {};
    this.hook();
  }

  uid(elt, noCreate) {
    return (elt._inspectID || ((noCreate) ? null : (elt._inspectID = ++_uid)));
  }
  get(elt) {
    return this.elements[this.uid(elt, true)];
  }

  hook() {
    debug('activating hooks');
    if (!_.isNil(this._cb)) {
      return;
    }
    this._cb = (elt) => {
      var inspect = new EltInspect(elt, this);
      this.elements[inspect.id] = inspect;
      _.defer(this.emit.bind(this, 'new', inspect));
    };
    PipeElement.hook().on('new', this._cb);
  }

  unhook() {
    debug('removing hooks');
    PipeElement.hook().removeListener('new', this._cb);
    /* hooks on PipeElement are not removed */
  }
}

module.exports = PipeInspect;
