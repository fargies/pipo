
include(Tools)

find_xlibrary(TIDY_LIBRARIES tidy PATH_SUFFIXES "tidy")
find_xpath(TIDY_INCLUDE_DIRS tidy.h PATH_SUFFIXES "tidy")

assert(TIDY_LIBRARIES "HtmlTidy library not found")
assert(TIDY_INCLUDE_DIRS "HtmlTidy headers not found")

