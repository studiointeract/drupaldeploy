#!/bin/bash

# Setup no strict host key checking.
GITHOST=$(echo "<%= repository %>" | sed -n 's/git@//p' | sed -n 's/:.*//p')
echo $GITHOST
if ! grep -q $GITHOST ~/.ssh/config; then
  mkdir -p ~/.ssh
  echo -e "Host $GITHOST\n\tStrictHostKeyChecking no\n" >> ~/.ssh/config
fi

# Use sudo if available.
SUDO=""
CAN_I_RUN_SUDO=$(sudo -n uptime 2>&1 | grep "load" | wc -l)
if [ ${CAN_I_RUN_SUDO} -gt 0 ]; then
  SUDO="sudo"
fi;

# Ignore file permission changes.
git config --global core.fileMode false

# DEPLOY

# Clone repository if first deploy.
if [ ! -d <%= installLocation %>/current ]; then
  cd <%= installLocation %>
  git clone -b master <%= repository %> current
else
  $SUDO rm -rf <%= installLocation %>/temp

  # Copy source files.
  if [ -d <%= installLocation %>/previous ]; then
    mv <%= installLocation %>/previous <%= installLocation %>/temp
    $SUDO rsync -az <%= installLocation %>/current/ <%= installLocation %>/temp/
  else
    $SUDO cp -R <%= installLocation %>/current <%= installLocation %>/temp
  fi

  # Pull latest changes.
  cd <%= installLocation %>/temp
  $SUDO chmod -R 777 <%= installLocation %>/temp
  $SUDO git reset --hard
  $SUDO git clean -fd
  $SUDO chmod -R 777 <%= installLocation %>/temp
  git pull origin <%= branch %>
  $SUDO chmod -R 755 <%= installLocation %>/temp
  cd <%= installLocation %>

  # Switch versions, current => previous && temp => current.
  $SUDO rm -rf <%= installLocation %>/previous
  mv <%= installLocation %>/current <%= installLocation %>/previous
  mv <%= installLocation %>/temp <%= installLocation %>/current
fi

# Set default permissions.
find <%= installLocation %>/current/<%= web %> -type f -exec $SUDO chmod 644 {} +
find <%= installLocation %>/current/<%= web %> -type d -exec $SUDO chmod 755 {} +

find <%= installLocation %>/default -type f -exec $SUDO chmod 644 {} +
find <%= installLocation %>/default -type d -exec $SUDO chmod 755 {} +
$SUDO chmod 744 <%= installLocation %>/default/settings.php

# Set group and owner.
$SUDO chown -R <%= group %>:<%= group %> <%= installLocation %>/current/<%= web %>
$SUDO chown -R <%= group %>:<%= group %> <%= installLocation %>/default

# Remove default settings.
$SUDO rm -rf <%= installLocation %>/current/<%= web %>/sites/default

# Create symbolic link to settings and files.
if [ -d <%= installLocation %>/current/<%= web %>/sites/default ]; then
  $SUDO rm <%= installLocation %>/current/<%= web %>/sites/default
fi
$SUDO ln -sf <%= installLocation %>/default <%= installLocation %>/current/<%= web %>/sites/default

# Create a symbolic link to the .htaccess file.
if [ -f <%= installLocation %>/.htaccess ]; then
  if [ -f <%= installLocation %>/current/<%= web %>/.htaccess ]; then
    $SUDO rm <%= installLocation %>/current/<%= web %>/.htaccess
  fi
  $SUDO ln -sf <%= installLocation %>/.htaccess <%= installLocation %>/current/<%= web %>/.htaccess
fi
