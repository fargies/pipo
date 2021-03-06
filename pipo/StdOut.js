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

/**
 * @module StdOut
 * @description prints items on the console
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
    this.fd = _.defaultTo(fd, process.stdout);
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
      this.fd.write(JSON.stringify(item, null, this.indent));
      if (this.eol) {
        this.fd.write("\n");
      }
      this.emit('item', item);
    }
  }
}

module.exports = StdOut;
