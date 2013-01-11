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

header="./build/header.txt"
plugin="./core/javascript/jquery.player.js"
decorator="./core/javascript/mediaplayer_decorator.js"
swfobject="./core/javascript/swfobject/swfobject.js"
jwplayer[0]="./custom/javascript/config/jwplayer-5/core/jwplayer.js"
jwplayer[1]="./custom/javascript/config/jwplayer-5/jw-player.config.js"
vimeo="./custom/javascript/config/vimeo/vimeo.config.js"
players[0]="./core/javascript/youtube_player.js"

output="./core/javascript/jquery.player.min.js"
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
      players[${#players[@]}]=${jwplayer[0]}
      players[${#players[@]}]=${jwplayer[1]}
      ;;
    "vimeo" )         
      players[${#players[@]}]=${vimeo}
      ;;
  esac
  shift
done

echo ${players[@]}

# combine all scripts
cat $swfobject ${players[@]} ${decorator} ${plugin} > $combined

echo -e "\nCompressing\n"
echo -e "${ANSI_GREEN}${swfobject}"
for player in ${players[@]}
do
  echo -e "${player}"
done
echo -e "${decorator}"
echo -e "${plugin}${ANSI_RESET}"
echo -e "\ninto\n"
echo -e "${ANSI_YELLOW}${output}${ANSI_RESET}"

# compress
java -jar "./build/yuicompressor-2.4.2.jar" $combined --type js --charset utf-8 --preserve-semi -o $compressed

cat $header $compressed > $output

echo -e "\nDone!"
