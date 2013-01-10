#!/bin/sh

ANSI_GREEN="\033[32m"
ANSI_YELLOW="\033[33m"
ANSI_RESET="\033[0m"

CURRENT_DIR=`/bin/pwd`

PLUGIN="${CURRENT_DIR}/core/javascript/jquery.player.js"
DECORATOR="${CURRENT_DIR}/core/javascript/mediaplayer_decorator.js"
SWFOBJECT="${CURRENT_DIR}/core/javascript/swfobject/swfobject.js"

# Players
JW_PLAYER="${CURRENT_DIR}/custom/javascript/config/jwplayer-5/jw-player.config.js"
VIMEO_PLAYER="${CURRENT_DIR}/custom/javascript/config/vimeo/vimeo.config.js"
YOUTUBE_PLAYER="${CURRENT_DIR}/core/javascript/youtube_player.js"

OUTPUT="${CURRENT_DIR}/core/javascript/jquery.player.min.js"
TEMP=$CURRENT_DIR/build/temp.js

on_exit() {
    /bin/rm -f $TEMP
}

trap on_exit INT TERM EXIT

# Combine all scripts.
/bin/cat $SWFOBJECT $JW_PLAYER $VIMEO_PLAYER $YOUTUBE_PLAYER $DECORATOR $PLUGIN > $TEMP

/bin/echo -e "\nCompressing\n"
/bin/echo -e "${ANSI_GREEN}${SWFOBJECT}"

for player in ${JW_PLAYER} ${VIMEO_PLAYER} ${YOUTUBE_PLAYER}; do
    /bin/echo -e "${player}"
done

/bin/echo -e "${DECORATOR}"
/bin/echo -e "${PLUGIN}${ANSI_RESET}"
/bin/echo -e "\ninto\n"
/bin/echo -e "${ANSI_YELLOW}${OUTPUT}${ANSI_RESET}"

# Compress using YUI Compressor.
java -jar ./build/yuicompressor-2.4.2.jar $TEMP --type js --charset utf-8 --preserve-semi -o $OUTPUT

/bin/echo -e "\nDone!"
