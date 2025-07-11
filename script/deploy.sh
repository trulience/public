#!/bin/sh
set -e
exec &>> build/apps-build.log
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm


do_exit() {
  cp build/apps-build.log /home/ubuntu/logs/ 
  date
  echo "$*"
  rm -f ~/APPSBUILD.lock
  exit 
}


cd /home/ubuntu/ASSETS/BUILD/public-apps

sleep $(shuf -i 2-5 -n 1)


lock(){
  if [ -f ~/APPSBUILD.lock ]; then
    echo "BUILD BUSY" "$(cat ~/APPSBUILD.lock)"
    exit
  fi
  echo "PUBLIC APPS BUILD $(date)" | tee -a  ~/APPSBUILD.lock
}


(git fetch && git reset --hard HEAD && git merge origin/main) || (do_exit "git pull failed")

script/should-build  || do_exit "no change"

sh script/build-public-apps.sh prod 
rsync -avz build/* /home/ubuntu/ASSETS/www/apps/public/ 
cp current-commit last-build-commit 
do_exit 'APPS BUILD DONE'
