declare ver='v42.285'

# static files
mkdir -p './prod/static/'
cp -R ./static/ ./prod/static/

# html
declare output_html_file=./prod/index.html

# minify html file
sed 's/^[ \t]*//g; /^$/d' ./index.prod.html >"$output_html_file"
sed -i '' -e ':a' -e 'N' -e '$!ba' -e 's/\n//g' "$output_html_file"

# set the right version of the js-script
sed -i '' 's/wata.min.js/wata.'"$ver"'.min.js/g' "$output_html_file"

# js
declare output_js_file="./prod/wata.$ver.min.js"

# delete the existing output file
if [ -f "$output_js_file" ]; then
  rm "$output_js_file"
fi

# get all the js-files in the correct order (according to their imports)
declare -a scripts=(
  ./sources/engine/misc.js
  ./sources/engine/logging.js
  ./sources/game/preloader.js
  ./sources/game/assets.js
  ./sources/ui/elements.js
  ./sources/engine/physics/cpmovement.js
  ./sources/engine/physics/screen.js
  ./sources/engine/physics/shooting.js
  ./sources/engine/sound/music.js
  ./sources/engine/player/player.js
  ./sources/engine/player/controls.js
  ./sources/engine/player/abilities.js
  ./sources/engine/npc/ant.js
  ./sources/engine/npc/antColony.js
  ./sources/engine/game/bonus.js
  ./sources/engine/game/puzzle.js
  ./sources/engine/game/level.js
  ./sources/engine/game/levelLoop.js
  ./sources/game/bonuses.js
  ./sources/game/levels.js
  ./sources/game/characters.js
  ./sources/ui/details/gameInfo.js
  ./sources/ui/details/playerControls.js
  ./sources/ui/details/playerInfo.js
  ./sources/ui/menu/mainMenu.js
  ./sources/ui/menu/charMenu.js
  ./sources/ui/menu/pauseMenu.js
  ./sources/ui/menu/endGameMenu.js
  ./sources/ui/menu/menu.js
  ./sources/ui/broadcast.js
  ./sources/ui/gameInterface.js
  ./sources/ui/ui.js
  ./sources/game/declarations.js
  ./sources/engine/game/stateManager.js
  ./sources/game.js
)

# join and minimize the js-files
eval closure-compiler -O WHITESPACE_ONLY --js_output_file "$output_js_file" --language_in UNSTABLE --language_out UNSTABLE --js "${scripts[*]}"

# delete all the line breaks
sed -i '' -e ':a' -e 'N' -e '$!ba' -e 's/\n/ /g' "$output_js_file"

# delete all the exports/imports (don't need all of them in a single file)
sed -i '' 's/import{[^;]*//g' "$output_js_file"
sed -i '' 's/export //g' "$output_js_file"

# point out the variables that we do need to export
declare -a exportVariables=(
  loadGame
  preloadAssets
  assets
  cssVariables
  sleep
)
for ev in "${exportVariables[@]}"; do
  sed -i '' 's/const '"$ev"'/export const '"$ev"'/' "$output_js_file"
done

# delete semicolon duplicates
while grep -q ';;' "$output_js_file"; do
  sed -i '' 's/;;/;/g' "$output_js_file"
done
