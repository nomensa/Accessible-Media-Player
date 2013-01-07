#! /bin/bash

ANSI_GREEN="\033[32m"
ANSI_YELLOW="\033[33m"
ANSI_RESET="\033[0m"

dir=`pwd`
plugin="${dir}/core/javascript/jquery.player.js"
decorator="${dir}/core/javascript/mediaplayer_decorator.js"
swfobject="${dir}/core/javascript/swfobject/swfobject.js"
players[0]="${dir}/custom/javascript/config/jwplayer-5/jw-player.config.js"
players[1]="${dir}/custom/javascript/config/vimeo/vimeo.config.js"
players[2]="${dir}/core/javascript/youtube_player.js"

output="${dir}/core/javascript/jquery.player.min.js"
temp=$dir/build/temp.js

function on_exit()
{
  rm -f ${temp}
}

trap on_exit INT TERM EXIT

# combine all scripts
cat $swfobject ${players[@]} ${decorator} ${plugin} > $temp

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
java -jar ./build/yuicompressor-2.4.2.jar $temp --type js --charset utf-8 --preserve-semi -o ${output}

echo -e "\nDone!"
