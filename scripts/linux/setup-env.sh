#!/bin/bash

# Install or upgrade old versions of Git.
sudo apt-get install git

# SETUP

# Create files and settings.
mkdir -p <%= installLocation %>/default/files

# Move in existing files if overwriting an old project.
if [ -d <%= documentRoot %>/sites/default/files ]; then
  cp -R <%= documentRoot %>/sites/default/files <%= installLocation %>/default
fi

# Create DocumentRoot tree (var/www/...) if it doesn't exists.
mkdir -p <%= documentRoot %>
# Remove the DocumentRoot folder in the DocumentRoot tree
chmod -R 777 <%= documentRoot %>
rm -rf <%= documentRoot %>

# Create symbolic link to Virtual Host DocumentRoot.
ln -sf <%= installLocation %>/current/<%= web %> <%= documentRoot %>
