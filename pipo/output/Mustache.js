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
** Created on: 2016-12-11T18:09:34+01:00
**     Author: Sylvain Fargier <fargie_s> <fargier.sylvain@free.fr>
**
*/

const
  _ = require('lodash'),
  mstch = require('mustache'),
  q = require('q'),
  fs = require('fs'),
  process = require('process'),
  debug = require('debug')('pipo:mstch'),
  Item = require('../Item'),
  PipeElement = require('../PipeElement');

/**
 * @module Mustache
 * @description Render Handlebars/Mustache templates
 *
 * ### Configuration
 * | Name         | Type                       | Default | Description         |
 * | :----------- | :------------------------- | :-----  | :------------------ |
 * | `template`   | string, filePath or object | null    | template to render  |
 * | [`outFile`]  | string                     | null    | file where to render (can't be used with object templates) |
 *
 * ### Items
 * | Name        | Type                       | Description         |
 * | :---------- | :------------------------- | :------------------ |
 * | `template`  | string, filePath or object | template to render  |
 * | [`outFile`] | string                     | null    | file where to render (can't be used with object templates) |
 *
 * ### Details
 *
 * If *template* is a string it is directly processed by Mustache, the result
 * will be set in `out` property.
 *
 * If *template* is a filePath the file contents will be rendered as a template.
 *
 * If *template* is an object then all it's properties will be rendered as
 * string templates and the result will be merged in current item.
 *
 * @example
 * {
 *   "pipe": "Mustache",
 *   "template": "{{var}}2",
 *   "var": 4
 * }
 * ===
 * {
 *   "var": 4,
 *   "out": "42"
 * }
 *
 * @example
 * // Using an object template
 * {
 *   "pipe": "Mustache",
 *   "template": { "var": "{{var}}2", "toto": "test" },
 *   "var": 4
 * }
 * ===
 * {
 *   "var": "42",
 *   "toto": "test"
 * }
 *
 * @example
 * // Outputing in a file, using config
 * {
 *   "pipe": "Mustache",
 *   "MustacheConfig": {
 *     "template": "{{var}}2",
 *     "outFile": "test.txt"
 *   },
 *   "var": 4
 * }
 * ===
 * // A test.txt file containing "42" has been created
 * { "var": 4 }
 */
class Mustache extends PipeElement {
  constructor() {
    super();
    this.template = null;
    this.outFile = null;
  }

  onItem(item) {
    super.onItem(item);

    var template = Item.take(item, 'template', this.template);
    if (!_.isNil(template)) {
      debug('rendering template');
      if (_.isObject(template)) {
        var tpl = _.mapValues(template, function(value) {
          return mstch.render(value, item);
        });
        _.forEach(tpl, function(value, key) {
          _.set(item, key, value);
        });
        this.emitItem(item);
      }
      else {
        this.ref();
        q.nfcall(fs.access, template, (fs.constants || fs).R_OK)
        .then(
          function() {
            return q.nfcall(fs.readFile, template)
            .then(
              function(data) { return data.toString(); },
              (err) => {
                this.error(`failed to open moustache template file ${template}: ${err}`);
              }
            );
          },
          function() { return template; }
        )
        .then(_.bind(this._mstchOut, this, _, item))
        .finally(() => {
          this.emitItem(item);
          this.unref();
        });
      }
    }
    else {
      this.emitItem(item);
    }
  }

  _mstchOut(tpl, item) {
    let outFile = Item.take(item, 'outFile', this.outFile);
    let data = mstch.render(tpl, item);

    if (_.isEmpty(data)) {
      return;
    }
    else if (_.isEmpty(outFile)) {
      item.out = data;
    } else {
      let writeFunc;
      if (outFile === "stdout") {
        writeFunc = process.stdout.write.bind(process.stdout);
      } else if (outFile === "stderr") {
        writeFunc = process.stderr.write.bind(process.stderr);
      } else {
        writeFunc = fs.writeFile.bind(null, outFile);
      }

      var defer = q.defer();
      debug('writing', outFile);
      writeFunc(data, null, (err) => {
        if (err) {
          this.error(`failed to open moustache out file ${outFile}: ${err}`);
        }
        defer.resolve();
      });
      return defer.promise;
    }
  }
}

module.exports = Mustache;
