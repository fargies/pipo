
include_directories(
    ${TIDY_INCLUDE_DIRS}
    ${CMAKE_BINARY_DIR}
    ${CMAKE_CURRENT_BINARY_DIR}
    ${CMAKE_CURRENT_SOURCE_DIR}
    ${CMAKE_CURRENT_SOURCE_DIR}/input
    ${CMAKE_CURRENT_SOURCE_DIR}/input/fetcher
    ${CMAKE_CURRENT_SOURCE_DIR}/filter
    ${CMAKE_CURRENT_SOURCE_DIR}/output
    ${CMAKE_CURRENT_SOURCE_DIR}/utils
    ${CMAKE_CURRENT_SOURCE_DIR}/vendor/qt-mustache
    )

set(pipo_SRCS
    Pipe.cpp Item.cpp ErrorItem.cpp
    InputPipe.cpp
    PipeBuilder.cpp PipeBuilderParseCtx.cpp

    output/StdioOut.cpp
    output/UsagePrint.cpp
    output/ItemQueue.cpp
    output/MailOut.cpp

    input/StdioIn.cpp
    input/FileIn.cpp
    input/DataIn.cpp
    input/ManualIn.cpp

    input/fetcher/HTMLFetcher.cpp
    input/fetcher/ZalmosFetcher.cpp

    filter/ProxyTester.cpp
    filter/XQuery.cpp
    filter/HTMLToXML.cpp
    filter/Mustache.cpp
    filter/Aggregate.cpp
    filter/SubPipe.cpp
    filter/Rename.cpp
    filter/Match.cpp

    utils/HtmlTidy.cpp
    utils/SignalWaiter.cpp

    vendor/qt-mustache/mustache.cpp
    )

set(pipo_HEADERS
    Pipe.hpp Item.hpp ErrorItem.hpp
    InputPipe.hpp
    PipeBuilder.hpp PipeBuilderParseCtx.hpp

    output/StdioOut.hpp
    output/UsagePrint.hpp
    output/ItemQueue.hpp
    output/MailOut.cpp

    input/StdioIn.hpp
    input/FileIn.hpp
    input/DataIn.hpp
    input/ManualIn.hpp

    input/fetcher/HTMLFetcher.hpp
    input/fetcher/ZalmosFetcher.hpp

    filter/ProxyTester.hpp
    filter/XQuery.hpp
    filter/HTMLToXML.hpp
    filter/Mustache.hpp
    filter/Aggregate.hpp
    filter/SubPipe.hpp
    filter/Rename.hpp
    filter/Match.hpp

    utils/HtmlTidy.hpp utils/HttpCodes.hpp
    utils/SignalWaiter.hpp

    vendor/qt-mustache/mustache.h
    )

add_info_files(
    vendor/qt-mustache/README.md
    )

include(${QT_USE_FILE})

find_package(BISON REQUIRED)
find_package(FLEX REQUIRED)

add_info_files(PipeBuilderParser.y PipeBuilderLexer.l)

if(PARSER_DEBUG)
    set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -DPIPO_YYDEBUG -DYYERROR_VERBOSE")
    set(BISON_DEBUG_FLAGS "-t")
endif(PARSER_DEBUG)

bison_target(PipeBuilderParser
    PipeBuilderParser.y
    ${CMAKE_CURRENT_BINARY_DIR}/PipeBuilderParser.cpp
    COMPILE_FLAGS "-d ${BISON_DEBUG_FLAGS}")

flex_target(PipeBuilderScanner
    PipeBuilderLexer.l
    ${CMAKE_CURRENT_BINARY_DIR}/PipeBuilderScanner.cpp
    COMPILE_FLAGS
    "-d --header-file=${CMAKE_CURRENT_BINARY_DIR}/PipeBuilderScanner.hpp")
add_flex_bison_dependency(PipeBuilderScanner PipeBuilderParser)

add_library(libpipo SHARED
    ${pipo_SRCS} ${pipo_HEADERS}
    ${BISON_PipeBuilderParser_OUTPUTS}
    ${FLEX_PipeBuilderScanner_OUTPUTS}
    )

qt_use_modules(libpipo Core Network XmlPatterns)
target_link_libraries(libpipo ${TIDY_LIBRARIES})
set_target_properties(libpipo PROPERTIES
    PUBLIC_HEADER "${pipo_HEADERS}"
    COMPILE_DEFINITIONS PIPO_INTERNAL)

#if (UNIX)
#    set_target_properties(libpipo PROPERTIES
#        COMPILE_FLAGS "-fvisibility=hidden")
#endif (UNIX)

add_executable(pipo pipo_main.cpp)
target_link_libraries(pipo libpipo)
qt_use_modules(pipo Core)

target_include_directories(libpipo PRIVATE ${QTPRIV_INCLUDES})
install(TARGETS libpipo pipo
    ARCHIVE DESTINATION ${CMAKE_INSTALL_LIBDIR} COMPONENT Devel
    LIBRARY DESTINATION ${CMAKE_INSTALL_LIBDIR} COMPONENT Runtime
    RUNTIME DESTINATION ${CMAKE_INSTALL_BINDIR} COMPONENT Runtime
    PUBLIC_HEADER DESTINATION ${CMAKE_INSTALL_INCLUDEDIR}/${PROJECT_NAME} COMPONENT Devel)
