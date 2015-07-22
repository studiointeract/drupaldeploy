#!/bin/bash

# Install Git
git --version 2>&1 >/dev/null
GIT_IS_AVAILABLE=$?
if [ $GIT_IS_AVAILABLE -ne 0 ];
  then
    sudo apt-get install git
fi;

# SETUP

# Remove existing current.
rm -rf ~/current

# Clone repository.
git clone -b master --single-branch <%= repository %> ~/current

# Create files and settings.
mkdir ~/default
touch ~/default/settings.php
sudo chmod 444 ~/default/settings.php
mkdir ~/default/files
sudo chmod -R 755 ~/default/files

# Remove default settings.
rm -rf ~/tmp/web/sites/default

# Create symbolic link to settings and files.
cd ~/current/web/sites/
ln -s ~/default default
cd ~

# Create symbolic link to web root.
ln -sf ~/current/web public_html
