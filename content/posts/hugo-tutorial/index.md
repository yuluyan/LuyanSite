---
type: posts
draft: false

title: "Hugo basics"
subtitle: "&mdash; Hugo static site generator walk-through (1)"
date: 2019-07-20T18:00:00-06:00

authors:
  - me

preview:
  - This will be a series of posts explaining the Hugo static site generator. A In this first post, I will cover the basic installation and usage of Hugo.

tags:
  - Web
---


## Install hugo on server
{{< highlight script >}}
apt update
apt upgrade
{{< /highlight>}}

~/.ssh/config
Host github.com
  User git
  IdentityFile /root/.ssh/github_sync
  IdentitiesOnly yes


  git clone git@github.com:yuluyan/LuyanSite.git



  pip install python-dateutil==1.4

  snap install hugo --channel=extended