#!/bin/bash

# Move in existing files from other project files folder.
if [ -n <%= rsyncFilesPath %> ]; then
  rsync -aze "ssh -o StrictHostKeyChecking=no" --delete <%= rsyncFilesPath %> <%= installLocation %>/default/files
fi
