#!/bin/sh
# @changed 2019.06.25, 09:57
BEMXJST="../node_modules/bem-xjst/bin/bem-xjst"
DATE=`date "+%Y.%m.%d %H:%M:%S"`
VERSION=`node $BEMXJST -v 2>&1`
echo "Generated at $DATE from bem-xjst v.$VERSION via '$0'" > !generated.txt
echo | node $BEMXJST -o BEMHTML.js \
&& dos2unix BEMHTML.js \
&& patch -lbf --verbose -i BEMHTML.js.diff \
&& echo ok
