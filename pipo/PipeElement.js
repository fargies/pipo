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
** Created on: 2016-11-01T18:24:21+01:00
**     Author: Sylvain Fargier <fargie_s> <fargier.sylvain@free.fr>
**
*/

const
  _ = require('lodash'),
  EventEmitter = require('events'),
  debug = require('debug')('pipo:elt');

class PipeElement extends EventEmitter {
  constructor() {
    super();
    this._ref = 0; /* initialize refcount */
    this._started = false;
  }

  onItem(item) {
    if (!this._started) {
      if (this._ref === 0) {
        /* direct use, not connected with 'next' -> let's get a ref */
        this.ref();
      }
      this.start();
    }

    debug(`${this.constructor.name}.onItem`);
    var configName = this.constructor.name + 'Config';
    var config = item[configName];
    delete item[configName];
    if (config) {
      this.setConfig(config);
    }
    if (this.name) {
      configName += "#" + this.name;
      config = item[configName];
      delete item[configName];
      if (config) {
        this.setConfig(config);
      }
    }
    if (!_.get(this._opts, 'noSeparateConfig', false)) {
      this.emitItem(this.takeConfig(item));
    }
  }

  emitItem(item) {
    if (!_.isEmpty(item)) {
      this.emit('item', item);
    }
  }

  takeConfig(item) {
    var config = {};
    _.forOwn(item, function(value, key, item) {
      let name = key.split('#', 2)[0];
      if (_.endsWith(name, 'Config')) {
        config[key] = value;
        delete item[key];
      }
    });
    return (_.isEmpty(config)) ? null : config;
  }

  setName(name) {
    this.name = name;
  }

  setConfig(config) {
    _.forOwn(config, (value, key) => {
      if (('set' + _.upperFirst(key)) in this) {
        this['set' + _.upperFirst(key)](value);
      } else if (key in this) {
        this[key] = value;
      }
    });
  }

  /**
   * @brief refcount this item
   */
  ref() {
    return ++this._ref;
  }

  /**
   * @brief decref this item
   * @details may emit the 'end' signal.
   */
  unref() {
    if (--this._ref <= 0) {
      debug(`${this.constructor.name}.end(${this._status})`);
      this.emit('end', this._status);
    }
  }

  end(status) {
    this._status = status;
    this.unref();
  }

  error(message) {
    this.emit('item', { errorString: message });
  }

  next(cb) {
    if (cb instanceof PipeElement) {
      this.on('item', function(item) { cb.onItem(item); });
      this.once('end', function(status) { cb.end(status); });
      cb.ref(); /* increments refcount */
      return cb;
    } else {
      return this.next(new CbPipeElement(cb));
    }
  }

  start() {
    if (!this._started) {
      this._started = true;
      if (this._ref === 0) {
        this.emit('end', 0);
      }
    }
  }

  usage() {
    return "";
  }
}

class CbPipeElement extends PipeElement
{
  constructor(cb) {
    super();
    this.cb = cb;
  }
  onItem(item) {
    item = this.cb(item);
    if (item) {
      this.emit('item', item);
    }
  }
}

module.exports = PipeElement;
