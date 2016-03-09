# drupaldeploy

A Drupal deployment tool using git and ssh

## Installation

```bash
npm install -g drupaldeploy
```

## Getting started

### Init

Creates a config.json and settings.php.

```bash
drupaldeploy init
```

Example config.json:
```json
{
  // Server authentication info.
  "servers": [
    {
      "host": "hostname",
      "username": "root"
    }
  ],

  // The repository SSH clone url of your project.
  "repository": "git@github.org:studiointeract/drupal-git-deploy.git",

  // The branch you want to deploy.
  "branch": "master",

  // Location of web root in the repository.
  "web": "web",

  // Virtual Host DocumentRoot on the server.
  "documentRoot": "~/public_html",

  // Location of repository and files on the server (you need write permission).
  "installLocation": "/home/root",

  // Location of your Drupal settings
  "settings": "./settings.php",

  // Group for the user running Apache on the server.
  "group": "www-data"
}
```


### Setup

Setup the server with your configuration and install git.

```bash
drupaldeploy setup
```

### Deploy

Deploy your Drupal project using git pull and ssh.

```bash
drupaldeploy deploy
```

> Notice! You need to setup ssh-agent (see below) for this to work, and have permissions to pull from your repository using your own ssh key.

#### SSH keys with passphrase (or ssh-agent support)

> This only tested with Mac/Linux/Windows 10

With the help of `ssh-agent`, `drupaldeploy` can use SSH keys encrypted with a
passphrase.

Here's the process:

* First remove your `pem` field from the `config.json`. So, your `config.json` only has the username and host only.
* Then start a ssh agent with `eval $(ssh-agent)` or ``eval `ssh-agent.exe` `` on Windows 10.
* Then add your ssh key with `ssh-add <path-to-key>`, i.e. `ssh-add ~/.ssh/id_rsa`.
* Then you'll asked to enter the passphrase to the key if you're using one.
* After that simply invoke `drupaldeploy` commands and they'll just work
* Once you've deployed your app kill the ssh agent with `ssh-agent -k`
