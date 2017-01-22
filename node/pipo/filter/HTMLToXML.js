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
** Created on: 2016-11-27T17:19:28+01:00
**     Author: Sylvain Fargier <fargie_s> <fargier.sylvain@free.fr>
**
*/

const
  htmltidy = require('htmltidy'),
  _ = require('lodash'),
  q = require('q'),
  PipeElement = require('../PipeElement'),
  Registry = require('../Registry');

const s_nsRe = /<[^\s]+\s+(?:[^\s=>]+="[^"]*"\s+)*[^\s=>]+(:)/g;

class HTMLToXML extends PipeElement {
  constructor() {
    super();
    this.noNamespaces = true;
  }

  onItem(item) {
    super.onItem(item);
    if ('html' in item) {
      HTMLToXML._tidyfy(item)
      .then(HTMLToXML._removeNs)
      .then(
        (item) => {
          this.emit('item', item);
        },
        (err) => {
          this.error(err.toString());
        }
      );
    } else if (!_.isEmpty(item)) {
      this.emit('item', item);
    }
  }

  static _tidyfy(item) {
    var def = q.defer();
    var opts = {
      "output-xml": true,
      "quote-nbsp": false,
      "quiet": true,
      "input-encoding": "utf-8",
      "output-encoding": "utf-8",
      "force-output": true,
      "clean": true
    };
    htmltidy.tidy(item.html, opts, function(err, data) {
      if (err) {
        def.reject(err);
      } else {
        item.xml = data;
        delete item.html;
        def.resolve(item);
      }
    });
    return def.promise;
  }
  static _removeNs(item) {
    var isMatch = true;
    function reMatch(match) {
      isMatch = true;
      return match.slice(0, match.length - 1) + '_';
    }

    while (isMatch) {
      isMatch = false;
      item.xml = item.xml.replace(s_nsRe, reMatch);
    }
    item.xml = item.xml.replace(/xmlns=/, 'xmlns_=');
    return item;
  }
}

Registry.add('HTMLToXML', HTMLToXML);

module.exports = HTMLToXML;
