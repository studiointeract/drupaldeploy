#!/bin/bash

# SQL Sync from other remote database.
# Sync files using SSH and mysqldump, using agent forwarding.
# mysql -uuser -ppass localdb < <$(ssh -C -o StrictHostKeyChecking=no user@host "mysqldump -uuser -ppass remotedb")
mysql -u<%= dbUsername %> -p<%= dbPassword %> \
  <%= dbDatabase %> < <$(ssh -C <%= remoteUser %>@<%= remoteHost %> \
  "mysqldump -u<%= remoteDBUsername %> -p<%= remoteDBPassword %> <%= remoteDBdatabase %>")
