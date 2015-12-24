
if(TESTS)

link_directories(
    ${CMAKE_BINARY_DIR}/src
    )
include_directories(
    ${CMAKE_SOURCE_DIR}/src
    ${CMAKE_SOURCE_DIR}/src/filter
    ${CMAKE_SOURCE_DIR}/src/output
    ${CMAKE_SOURCE_DIR}/src/input
    ${CMAKE_SOURCE_DIR}/src/input/fetcher
    ${CMAKE_SOURCE_DIR}/src/utils
    ${CMAKE_BINARY_DIR}
    ${CMAKE_BINARY_DIR}/src
    ${CMAKE_BINARY_DIR}/tests
    ${CPPUNIT_INCLUDE_DIRS})

include(${QT_USE_FILE})

add_library(testHelper SHARED
    test_main.cpp qt_runner.cpp qt_runner.hpp
    test_helpers_stddump.hpp test_helpers_stddump.cpp
    test_helpers.hpp test_helpers.cpp)
target_link_libraries(testHelper ${CPPUNIT_LIBRARIES} ${QT_LIBRARIES})

set(test_SRCS
    stub_HTTPServer.cpp stub_HTTPServer.hpp

    test_PipeBuilderScanner.cpp
    test_PipeBuilderParser.cpp
    test_XQuery.cpp
    test_HTMLToXML.cpp
    test_Mustache.cpp
    test_Aggregate.cpp
    test_HTMLFetcher.cpp
    test_SubPipe.cpp
    test_Rename.cpp
    test_Match.cpp
    )

set(test_manual_SRCS
    test_MailOut.cpp
    test_ProxyTester.cpp
    test_ZalmosFetcher.cpp
    )

add_executable(test_auto ${test_SRCS})
target_link_libraries(test_auto testHelper libpipo ${CPPUNIT_LIBRARIES})
qt_use_modules(test_auto Core)

add_executable(test_manual ${test_manual_SRCS})
target_link_libraries(test_manual testHelper libpipo ${CPPUNIT_LIBRARIES})
qt_use_modules(test_manual Core)

add_test(test_auto ${CMAKE_CURRENT_BINARY_DIR}/test_auto)

endif(TESTS)

