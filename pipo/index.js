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

module.exports = {
  Registry: require('./Registry'),
  get: function(elt) { return module.exports.Registry.get(elt); },

  PipeElement: require('./PipeElement'),
  StdIn: require('./StdIn'),
  StdOut: require('./StdOut'),
  Null: require('./Null'),
  Rename: require('./Rename'),
  SubPipe: require('./SubPipe'),
  Aggregate: require('./Aggregate'),
  Duplicate: require('./Duplicate'),

  HTMLFetcher: require('./input/HTMLFetcher'),

  ListDir: require('./files/ListDir'),
  RenameFile: require('./files/RenameFile'),

  HTMLToXML: require('./filter/HTMLToXML'),
  XQuery: require('./filter/XQuery'),
  ReFilter: require('./filter/ReFilter'),
  Replace: require('./filter/Replace'),

  Mustache: require('./output/Mustache')
};
