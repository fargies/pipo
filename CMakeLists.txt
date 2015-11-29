cmake_minimum_required(VERSION 2.8)

cmake_policy(SET CMP0020 NEW)

project(pipo CXX C)

set(CMAKE_MODULE_PATH "${CMAKE_SOURCE_DIR}/cmake" ${CMAKE_MODULE_PATH})

include(GitVersion)

set(VER_MAJOR 1)
set(VER_MINOR 0)
set(VER_PATCH "${GIT_COUNT}")
set(VERSION "${VER_MAJOR}.${VER_MINOR}.${VER_PATCH}")
message(STATUS "Configuring version: ${VERSION}")
file(WRITE ${CMAKE_BINARY_DIR}/.version ${VERSION})

set(CMAKE_AUTOMOC True)

option(TESTS "Compile and run unit tests" OFF)
option(COVERAGE "Enable code coverage" OFF)
option(PARSER_DEBUG "Enable parser debugging" OFF)

include(Dependencies)
include(AddInfoFiles)
include(CopyFiles)
include(QMLTestRunner)

if (COVERAGE)
  set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -fprofile-arcs -ftest-coverage -lgcov")
endif (COVERAGE)

if (NOT MSVC)
    set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -pedantic")
    set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -pedantic -Wno-long-long")
    set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -Wnon-virtual-dtor -Woverloaded-virtual -Wunused-parameter -Wuninitialized")
endif (NOT MSVC)

configure_file("config.h.in" "config.h")
configure_file("version.h.in" "version.h")

add_subdirectory(src)
add_subdirectory(tests)
add_subdirectory(doc)

