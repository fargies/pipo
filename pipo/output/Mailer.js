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
** Created on: 2017-05-01T21:40:50+02:00
**     Author: Sylvain Fargier 🙈 <fargie_s> <fargier.sylvain@free.fr>
**
*/

const
  _ = require('lodash'),
  nodemailer = require('nodemailer');


class Mailer extends PipeElement {
  constructor() {
    super();
    this.transport = null;
    this.from = "";
    this.to = "";
    this.subject = "";
  }

  onItem(item) {
    super.onItem(item);
    this._sendMail(item);

    if (!_.isEmpty(item)) {
      this.emit('item', item);
    }
  }

  _sendMail(item) {
    if (!_.has(item, "text") && !_.has(item, "subject") &&
        !_.has(item, "text")) { return; }

    try {
      let mail = {
        from: _.defaultTo(item.from, this.from),
        to: _.defaultTo(item.to, this.to),
        subject: _.defaultTo(item.subject, this.subject)
      };
      _.assign(mail, item);

      if (_.isNil(this.transport)) {
        throw "Failed to send mail: undefined transport";
      } else if (_.isEmpty(mail.to)) {
        throw "Failed to send mail: no destination";
      }
      _.assign(mail, item);
      delete item.from;
      delete item.to;
      delete item.subject;
      delete item.text;
      delete item.html;

      this.ref();
      this.transport.sendMail(mail, (err) => {
        if (err) {
          this.error(`Failed to send mail: ${err}`);
        }
        this.unref();
      });
    } catch (err) {
      this.error(err);
    }
  }
}

module.exports = Mailer;
