#!/bin/bash

# Install Git
git --version 2>&1 >/dev/null
GIT_IS_AVAILABLE=$?
if [ $GIT_IS_AVAILABLE -ne 0 ];
  then
    sudo apt-get install git
fi;

# SETUP

# Create files and settings.
mkdir -p <%= installLocation %>/default
mkdir <%= installLocation %>/default/files

# Create DocumentRoot tree (var/www/...) if it doesn't exists.
mkdir -p <%= documentRoot %>
# Remove the DocumentRoot folder in the DocumentRoot tree
rm -rf <%= documentRoot %>

# Create symbolic link to Virtual Host DocumentRoot.
ln -sf <%= installLocation %>/current/<%= web %> <%= documentRoot %>
