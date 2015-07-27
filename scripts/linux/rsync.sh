#!/bin/bash

# Move in existing files from other project files folder.
if [ -n <%= rsyncFilesPath %> ]; then
  rsync -a <%= rsyncFilesPath %> <%= installLocation %>/default/
fi
