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
** Created on: 2016-11-04T22:42:18+01:00
**     Author: Sylvain Fargier <fargie_s> <fargier.sylvain@free.fr>
**
*/

const
  _ = require('lodash'),
  debug = require('debug')('pipo:index'),
  Registry = require('./Registry');


module.exports = new Proxy(
  {
    Registry: Registry,
    get: function(elt) { return Registry.get(elt); },

    PipeElement: require('./PipeElement')
  },
  {
    get: function(target, property) {
      if (_.has(target, property)) {
        return Reflect.get(target, property);
      }
      else {
        return target.Registry.get(property);
      }
    },

    has: function(target, property) {
      return Reflect.has(target, property) ||
        _.has(target.Registry.pipes, property);
    }
  }
);
