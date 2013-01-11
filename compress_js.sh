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

players[0]=$DECORATOR
players[1]=$YOUTUBE_PLAYER
compressed="./build/compressed.js"
combined="./build/combined.js"

function on_exit()
{
  rm -f ${combined}
  rm -f ${compressed}
}

trap on_exit INT TERM EXIT

# Add any sent players
while [ "$1" != "" ]; do
  case $1 in
    h )               
      usage
      exit 1
      ;;
    "jwplayer" )      
      players[${#players[@]}]=$JWPLAYER
      players[${#players[@]}]=$JWPLAYER_CONFIG
      ;;
    "vimeo" )         
      players[${#players[@]}]=${VIMEO_PLAYER}
      ;;
  esac
  shift
done

# combine all scripts
cat ${SWFOBJECT} ${players[@]} ${DECORATOR} ${PLUGIN} > $combined

echo -e "\nCompressing\n"
echo -e "${ANSI_GREEN}${SWFOBJECT}"

for player in ${players[@]}; do
    echo -e "${player}"
done

echo ""
echo -e "${ANSI_RESET}into"
echo ""
echo -e "${ANSI_YELLOW}${OUTPUT}${ANSI_RESET}"

# compress
java -jar "./build/yuicompressor-2.4.2.jar" $combined --type js --charset utf-8 --preserve-semi -o $compressed

cat $HEADER $compressed > $OUTPUT

echo -e "\nDone!"
