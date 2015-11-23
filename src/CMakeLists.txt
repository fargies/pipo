
include_directories(${TIDY_INCLUDE_DIRS})

set(pipo_SRCS
    Pipe.cpp
    Item.cpp ErrorItem.cpp
    InputPipe.cpp
    StdioOut.cpp
    EodDataStockExFetcher.cpp
    HtmlTidy.cpp
    DataInput.cpp)

set(pipo_HEADERS
    Pipe.hpp
    Item.hpp ErrorItem.hpp
    InputPipe.hpp
    StdioOut.hpp
    EodDataStockExFetcher.hpp
    HtmlTidy.hpp
    DataInput.hpp)


include(${QT_USE_FILE})

add_library(libpipo SHARED
    ${pipo_SRCS} ${pipo_HEADERS})

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
