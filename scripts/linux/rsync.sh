#!/bin/bash

# Move in existing files from other project files folder.
if [ -n <%= rsyncFilesPath %> ]; then
  rsync -az --delete <%= rsyncFilesPath %> <%= installLocation %>/default/files
fi
