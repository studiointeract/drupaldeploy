#!/bin/bash

# Use sudo if available.
SUDO=""
CAN_I_RUN_SUDO=$(sudo -n uptime 2>&1 | grep "load" | wc -l)
if [ ${CAN_I_RUN_SUDO} -gt 0 ]; then
  SUDO="sudo"
fi;

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

# Give write permissions to be able to overwrite this later.
if [ -f <%= installLocation %>/default/settings.php ]; then
  $SUDO chmod a+w <%= installLocation %>/default/settings.php
  # Drupal will automatically secure this file after the deployment.
fi

# Remove any potentially old htaccess file.
if [ -f <%= installLocation %>/.htaccess ]; then
  $SUDO rm <%= installLocation %>/.htaccess
fi
