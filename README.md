# studiointeract

A Drupal deployment tool using git and ssh

## Installation

```bash
npm install -g studiointeract
```

## Getting started

### Init

Creates a config.json and settings.php.

```bash
studiointeract init
```

### Setup

Setup the server with your configuration and install git.

```bash
studiointeract setup
```

### Deploy

Deploy your Drupal site using git pull and ssh.

```bash
studiointeract deploy
```

> Notice! You need to setup ssh-agent (see below) for this to work, and have permissions to pull from your repository using your own ssh key.

#### SSH keys with passphrase (or ssh-agent support)

> This only tested with Mac/Linux

With the help of `ssh-agent`, `mup` can use SSH keys encrypted with a
passphrase.

Here's the process:

* First remove your `pem` field from the `mup.json`. So, your `mup.json` only has the username and host only.
* Then start a ssh agent with `eval $(ssh-agent)`
* Then add your ssh key with `ssh-add <path-to-key>`
* Then you'll asked to enter the passphrase to the key
* After that simply invoke `mup` commands and they'll just work
* Once you've deployed your app kill the ssh agent with `ssh-agent -k`
