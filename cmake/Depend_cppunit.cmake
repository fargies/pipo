
if(TESTS)

include(FindPkgConfig)
include(Tools)

pkg_check_modules(CPPUNIT cppunit)
if(NOT CPPUNIT_FOUND)
    find_xlibrary(CPPUNIT_LIBRARIES cppunit PATH_SUFFIXES "cppunit")
    find_xpath(CPPUNIT_INCLUDE_DIRS "cppunit/TestFixture.h")
    if(NOT CPPUNIT_LIBRARIES OR NOT CPPUNIT_INCLUDE_DIRS)
        message(SEND_ERROR "CppUnit library not found")
    endif()
    get_filename_component(CPPUNIT_LIB_DIRS "${CPPUNIT_LIBRARIES}" DIRECTORY)
    if(WIN32)
        list(APPEND CPPUNIT_LIB_DIRS "${CPPUNIT_LIB_DIRS}/../bin")
    endif()
    set(CPPUNIT_LIB_DIRS "${CPPUNIT_LIB_DIRS}" CACHE STRING "CppUnit library paths" FORCE)
endif()

enable_testing()

endif(TESTS)

