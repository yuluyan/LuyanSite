---
type: posts
draft: false

title: "Complete setup of Shadowsocks (1)"
subtitle: "Installation and setup"
date: 2017-02-15T18:00:00-06:00

authors:
  - me

preview:
  - This post takes notes of a Complete process of setting up Shadowsocks and Shadowsocks-manager on Ubuntu 16.04. The first post is about the basic installation and setup process.

tags:
  - VPS
---
{{< oldpostflag >}}

This post takes notes of a Complete process of setting up Shadowsocks and Shadowsocks-manager on Ubuntu 16.04.

## Preparation
Start from an fresh installed Ubuntu 16.04. First do an update:
{{< highlight plaintext >}}
sudo apt update
sudo apt upgrade
{{< /highlight>}}

Install screen
{{< highlight plaintext >}}
sudo apt install screen
{{< /highlight>}}

Install Node.js
{{< highlight plaintext >}}
curl -sL https://deb.nodesource.com/setup_11.x | sudo -E bash -
sudo apt install nodejs
{{< /highlight>}}

Install Redis
{{< highlight plaintext >}}
sudo apt install redis-server
{{< /highlight>}}

Install Shadowsocks. The branch I choose is [Shadowsocks-libev](https://github.com/shadowsocks/shadowsocks-libev).
Note that Shadowsocks-manager does not support ShadowsocksR.
{{< highlight plaintext >}}
sudo apt install software-properties-common -y
sudo add-apt-repository ppa:max-c-lv/shadowsocks-libev -y
sudo apt update
sudo apt install shadowsocks-libev
{{< /highlight>}}

Install Shadowsocks-manager
{{< highlight plaintext >}}
npm i -g shadowsocks-manager --unsafe-perm
{{< /highlight>}}


## Setups

### Setup Redis
Check installation
{{< highlight plaintext >}}
redis-server
{{< /highlight>}}

Set Redis password
{{< highlight plaintext >}}
redis-cli
> config set requirepass PWD
> auth PWD
{{< /highlight>}}

### Setup Shadowsocks manager
Make a directory for config files
{{< highlight yml >}}
mkdir ~/.ssmgr
cd ~/.ssmgr
{{< /highlight>}}

Create a type {{< f s  >}} config file for each proxy server. The address under {{< f shadowsocks  >}} is the port exposed by the shadowsocks. Here it is {{< f "127.0.0.1:6001"  >}}. The port under {{< f manager  >}} is used by shadowsocks-manager to listen control command from the master server. 
{{< highlight yml "hl_lines=7">}}
# ss.yml
type: s
shadowsocks:
  address: 127.0.0.1:6001
manager:
  address: 0.0.0.0:6002
  password: 'password'
db: 'db.sqlite'
{{< /highlight>}}

Create a type {{< f m  >}} GUI config file for the master server. The address should be the actual IP address of the master server.
{{< highlight yml "hl_lines=4 5 16-18 33" >}}
# webgui.yml
type: m
manager:
  address: xxx.xxx.xxx.xxx:6002
  password: 'password'
plugins:
  flowSaver:
    use: true
  user:
    use: true
  account:
    use: true
  email:
    use: true
    type: 'smtp'
    username: 'ss_luyan@163.com'
    password: 'password'
    host: 'smtp.gmail.com'
  webgui:
    use: true
    host: '0.0.0.0'
    port: '80'
     site: 'http://ss.yuluyan.com'
    # icon: 'icon.png'
    # skin: 'default'
    # googleAnalytics: 'UA-xxxxxxxx-x'
    # gcmSenderId: '476902381496'
    # gcmAPIKey: 'AAAAGzddLRc:XXXXXXXXXXXXXX'
db: 'webgui.sqlite'
redis:
  host: '127.0.0.1'
  port: 6379
  password: 'PWD'
  db: 0
{{< /highlight>}}

## Run Shadowsocks and Shadowsocks-manager
Use the following command to run them
{{< highlight plaintext "hl_lines=4">}}
screen -dmS ssserver ss-manager -m chacha20-ietf-poly1305 -u --manager-address 127.0.0.1:6001
screen -dmS ssmanager ssmgr -c ss.yml
screen -dmS ssgui ssmgr -c webgui.yml
{{< /highlight>}}

## Create another node
Create a similar {{< f "ss.yml"  >}} file on the node and configure correspondingly in the portal.