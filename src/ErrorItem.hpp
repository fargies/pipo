/**
 ** Copyright (C) 2015 fargie_s
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
 **
 **
 **        Created on: 11/22/2015
 **   Original Author: fargie_s
 **
 **/

#ifndef ERRORITEM_HPP
#define ERRORITEM_HPP

#include "Item.hpp"

class ErrorItem : public Item
{
public:
    ErrorItem(const QString &errorString);
    ErrorItem(const Item &other);

    static bool isErrorItem(const Item &item);

    QString errorString() const;
    void setErrorString(const QString &error);

    /**
     * @brief resolve a %[1-9] argument in the errorString
     * @param[in] arg the string to be inserted
     * @return the errorItem
     *
     * @details this method simplifies the following writing :
     * ErrorItem(QString("my error %1").arg("42"))
     * -> ErrorItem("my error %1").arg("42")
     */
    ErrorItem &arg(const QString &arg);
};

#endif // ERRORITEM_HPP
