#! /bin/bash

# Script to automate maintenance and deployment to git repo
# Run by typing './deploy.sh'

do_deploy() {
    while true; do
        read -p "Do you wish to deploy to github? [Y/N] " deploy
        case $deploy in
            [Yy]* ) echo "Pushing to github"
            git push -u origin master; break;;
            [Nn]* ) break;;
            * ) echo "Please answer Yy (yes) or Nn (no) only.";
        esac
    done
}

do_commit() {
    while true; do
        read -p "Do you wish to commit the work? [Y/N] " commit
        case $commit in
            [Yy]* ) read -p "Type commit message " msg
            echo "Committing..."
            git add .
            git commit -m "$msg"
            do_deploy; break;;
            [Nn]* ) do_deploy; break;;
            * ) echo "Please answer Yy (yes) or Nn (no) only.";
        esac
    done
}

increment_version() {
    version=$(jq .version version.json)
    let version=version+1
    echo '{ "version": '$version' }' > version.json
}

while true; do
    read -p "Do you wish to increment the version? [Y/N] " increment
    case $increment in
        [Yy]* ) increment_version
        do_commit; break;;
        [Nn]* ) do_commit; break;;
        * ) echo "Please answer Yy (yes) or Nn (no) only.";
    esac
done
