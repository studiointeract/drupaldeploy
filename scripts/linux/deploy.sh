#!/bin/bash

# Setup no strict host key checking.
GITHOST=$(echo "<%= repository %>" | sed -n 's/git@//p' | sed -n 's/\/.*//p')
echo $GITHOST
if ! grep -q $GITHOST ~/.ssh/config; then
  echo -e "Host $GITHOST\n\tStrictHostKeyChecking no\n" >> ~/.ssh/config
fi

# DEPLOY

# Clone repository if first deploy.
if [ ! -d <%= installLocation %>/current ]; then
  cd <%= installLocation %>
  git clone -b master <%= repository %> current
else
  #sudo rm -rf <%= installLocation %>/temp
  rm -rf <%= installLocation %>/temp

  # Copy source files.
  cp -R <%= installLocation %>/current <%= installLocation %>/temp

  # Pull latest changes.
  cd <%= installLocation %>/temp
  git checkout -- .
  git pull origin <%= branch %>
  cd <%= installLocation %>

  # Switch versions, current => previous && temp => current.
  rm -rf <%= installLocation %>/previous
  mv <%= installLocation %>/current <%= installLocation %>/previous
  mv <%= installLocation %>/temp <%= installLocation %>/current
fi

# Set default permissions.
#sudo chmod -R 754 <%= installLocation %>/current/<%= web %>
#sudo chmod -R 760 <%= installLocation %>/current/<%= web %>/index.php
#sudo chmod -R 754 <%= installLocation %>/default
#sudo chmod -R 775 <%= installLocation %>/default/files
#sudo chmod 744 <%= installLocation %>/default/settings.php
chmod -R 754 <%= installLocation %>/current/<%= web %>
chmod -R 760 <%= installLocation %>/current/<%= web %>/index.php
chmod -R 754 <%= installLocation %>/default
chmod -R 775 <%= installLocation %>/default/files
chmod 744 <%= installLocation %>/default/settings.php


# Set group.
#sudo chgrp -R <%= group %> <%= installLocation %>/current/<%= web %>
#sudo chgrp -R <%= group %> <%= installLocation %>/default
chgrp -R <%= group %> <%= installLocation %>/current/<%= web %>
chgrp -R <%= group %> <%= installLocation %>/default

# Remove default settings.
#sudo rm -rf <%= installLocation %>/current/<%= web %>/sites/default
rm -rf <%= installLocation %>/current/<%= web %>/sites/default

# Create symbolic link to settings and files.
#sudo rm <%= installLocation %>/current/<%= web %>/sites/default
#sudo ln -sf <%= installLocation %>/default <%= installLocation %>/current/<%= web %>/sites/default
rm <%= installLocation %>/current/<%= web %>/sites/default
ln -sf <%= installLocation %>/default <%= installLocation %>/current/<%= web %>/sites/default
