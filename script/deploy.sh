#!/bin/bash
set -e
exec > >(tee build.log) 2>&1

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm


do_exit() {
  cp build.log /home/ubuntu/logs/apps-build.log
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


#(git fetch && git reset --hard HEAD && git merge origin/main) || (do_exit "git pull failed")
(git checkout main && git pull) || (do_exit "git pull failed")

script/should-build  || do_exit "no change"

sh script/build-public-apps.sh prod 
rsync -avz --delete build/* /home/ubuntu/ASSETS/www/apps/public/ 
cp current-commit last-build-commit 
do_exit 'APPS BUILD DONE'
