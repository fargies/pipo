
include(FindPkgConfig)
include(Tools)

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
endif(QMAKE_EXECUTABLE)

find_package(Qt5Core REQUIRED)

if(Qt5Core_FOUND)
    set(QTVERSION "${Qt5Core_VERSION_STRING}")
    message(STATUS "Using Qt ${QTVERSION}")
    find_package(Qt5Network REQUIRED)
    find_package(Qt5XmlPatterns REQUIRED)
    find_package(Qt5Qml REQUIRED)

    set(QT_USE_FILE "${CMAKE_CURRENT_LIST_DIR}/ECMQt4To5Porting.cmake")
    include("${CMAKE_CURRENT_LIST_DIR}/ECMQt4To5Porting.cmake")

    macro(qt_use_modules)
        qt5_use_modules(${ARGN})
    endmacro()
endif(Qt5Core_FOUND)

# Find Qt's private headers
find_path(QTPRIV_INCLUDES qobject_p.h
        PATHS ${QT_INCLUDES}
        PATH_SUFFIXES "${QTVERSION}/QtCore/private" "private")
if(NOT QTPRIV_INCLUDES)
    message(SEND_ERROR "Qt private headers not found ${QTVERSION} ${QT_INCLUDES}")
endif(NOT QTPRIV_INCLUDES)

