
include(FindPkgConfig)
include(Tools)

option(IGNORE_QT5 "Ignore Qt5 install and compile with Qt4" OFF)
# Detect requested Qt version
find_program(QMAKE_EXECUTABLE NAMES qmake)
if(QMAKE_EXECUTABLE)
    function(_QUERY_QMAKE VAR RESULT)
        execute_process(COMMAND "${QMAKE_EXECUTABLE}" -query ${VAR}
            RESULT_VARIABLE return_code
            OUTPUT_VARIABLE output
            OUTPUT_STRIP_TRAILING_WHITESPACE ERROR_STRIP_TRAILING_WHITESPACE)
        if(NOT return_code)
            file(TO_CMAKE_PATH "${output}" output)
            set(${RESULT} ${output} PARENT_SCOPE)
        endif()
    endfunction()
    _query_qmake(QT_VERSION CURR_QT_VERSION)
    message(STATUS "Requested Qt version: ${CURR_QT_VERSION}")
    if(CURR_QT_VERSION VERSION_LESS 5.0.0)
        set(IGNORE_QT5 ON)
    endif(CURR_QT_VERSION VERSION_LESS 5.0.0)
endif(QMAKE_EXECUTABLE)

if(NOT IGNORE_QT5)
    find_package(Qt5Core QUIET)
endif(NOT IGNORE_QT5)

if(Qt5Core_FOUND)
    set(QTVERSION "${Qt5Core_VERSION_STRING}")
    message(STATUS "Using Qt ${QTVERSION}")
    find_package(Qt5Network REQUIRED)
    find_package(Qt5XmlPatterns REQUIRED)

    set(QT_USE_FILE "${CMAKE_CURRENT_LIST_DIR}/ECMQt4To5Porting.cmake")
    include("${CMAKE_CURRENT_LIST_DIR}/ECMQt4To5Porting.cmake")

    macro(qt_use_modules)
        qt5_use_modules(${ARGN})
    endmacro()
else(Qt5Core_FOUND)
    set(QT_REQ QtCore QtNetwork QtXmlPatterns)

    find_package(Qt4 4.7 REQUIRED ${QT_REQ})
    message(STATUS "Using Qt ${QTVERSION}")

    function(qt_use_modules TARGET MODULES)
        list(REMOVE_ITEM MODULES "Widgets")
        if (MODULES)
            qt4_use_modules(${TARGET} ${MODULES})
        endif (MODULES)
    endfunction()
endif(Qt5Core_FOUND)

# Find Qt's private headers
find_path(QTPRIV_INCLUDES qobject_p.h
        PATHS ${QT_INCLUDES}
        PATH_SUFFIXES "${QTVERSION}/QtCore/private" "private")
if(NOT QTPRIV_INCLUDES)
    message(SEND_ERROR "Qt private headers not found ${QTVERSION} ${QT_INCLUDES}")
endif(NOT QTPRIV_INCLUDES)

