
if(TESTS)

link_directories(
    ${CMAKE_BINARY_DIR}/src
    )
include_directories(
    ${CMAKE_SOURCE_DIR}/src
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
#    test_PipeBuilderScanner.cpp
    test_PipeBuilderParser.cpp
    )

add_executable(test_all ${test_SRCS})
target_link_libraries(test_all testHelper libpipo)
qt_use_modules(test_all Core)

add_test(test_all ${CMAKE_CURRENT_BINARY_DIR}/test_all)

endif(TESTS)

