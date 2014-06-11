#! /bin/bash
#
# Compress the required media player JavaScripts into one file
#

usage()
{
cat << EOF
Usage: $0 [players...]

Compress the required media player JavaScripts into one file

EXAMPLES:
  compress_js.sh vimeo
  compress_js.sh vimeo jwplayer

EOF
}

ANSI_GREEN="\033[32m"
ANSI_YELLOW="\033[33m"
ANSI_RESET="\033[0m"

HEADER="./build/header.txt"
PLUGIN="./core/javascript/jquery.player.js"
DECORATOR="./core/javascript/mediaplayer_decorator.js"
SWFOBJECT="./core/javascript/swfobject/swfobject.js"
JWPLAYER="./custom/javascript/config/jwplayer-5/core/jwplayer.js"
JWPLAYER_CONFIG="./custom/javascript/config/jwplayer-5/jw-player.config.js"
VIMEO_PLAYER="./custom/javascript/config/vimeo/vimeo.config.js"
YOUTUBE_PLAYER="./core/javascript/youtube_player.js"
OUTPUT="./core/javascript/jquery.player.min.js"

COMPRESSED="./build/compressed.js"
COMBINED="./build/combined.js"

trap "rm -f ${COMBINED}; rm -f ${COMPRESSED}; exit 1" INT TERM EXIT

printf "\nCompressing\n\n"
printf "%b${ANSI_GREEN}"

cat ${SWFOBJECT} ${YOUTUBE_PLAYER} ${DECORATOR} > $COMBINED
printf "${SWFOBJECT}\n${YOUTUBE_PLAYER}\n${DECORATOR}\n"

# Add any sent players
while [ "$1" != "" ]; do
  case $1 in
    h )               
      usage
      exit 1
      ;;
    "jwplayer" )      
      cat ${JWPLAYER} ${JWPLAYER_CONFIG} >> $COMBINED
      printf "${JWPLAYER}\n${JWPLAYER_CONFIG}\n"
      ;;			
    "vimeo" )         
      cat ${VIMEO_PLAYER} >> $COMBINED
      printf "${VIMEO_PLAYER}\n"
      ;;
  esac
  shift
done

# combine all scripts
cat ${PLUGIN} >> $COMBINED
printf "${PLUGIN}\n"

/bin/echo ""
printf "%b${ANSI_RESET}into\n\n"
printf "%b${ANSI_YELLOW}${OUTPUT}${ANSI_RESET}\n"

# compress
java -jar "./build/yuicompressor-2.4.2.jar" $COMBINED --type js --charset utf-8 --preserve-semi -o $COMPRESSED

cat $HEADER $COMPRESSED > $OUTPUT

printf "\nDone!"
