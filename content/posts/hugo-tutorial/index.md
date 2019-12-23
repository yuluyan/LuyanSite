---
type: posts
draft: false

title: "Hugo basics"
subtitle: "&mdash; Hugo static site generator walk-through (1)"
date: 2019-07-20T18:00:00-06:00

authors:
  - me

preview:
  - This will be a series of posts explaining the Hugo static site generator. The first post covers the installation and deployment.

tags:
  - Web
---

## What is Hugo
Hugo is a **static site generator** written in [Go](https://golang.org). As its name suggests, it can transform your structured content files into a full-fledged **static** website. 
For example, this post, as well as all other posts, was originally {{< mmaf ".md" false >}} markdown notes. After going throught the Hugo pipeline, these content were parsed and assembled into this static webpage as you are seeing now. Hugo is not only a markdown renderer. It also has a powerful template system with the inherited Golang syntax that can reduce the amount of work on your side.

Hugo also has hundreds of themes available contributed by the community. Basically, a theme is a collection of templates. You will only need to focus on the content of your website if you don't want to spend too much time on tweaking the style of your website. But if you are a person like me, you can dig into the theme folder and take full control of it.

{{< figure src="compare.png#center" width="280">}}

So what's the difference between a static site generator and dynamic website framework like WordPress? The main selling point is the performance. Unlike dynamic webpage, static webpage is rendered once forever thus it is way faster to serve. And also the security of static site is boosted due to the lack of database that is essential for dynamic frameworks.

Let along all this technicalities, the one thing you should think about before choosing between these two is whether or not you need a *dashboard* to manage your content. If you are using WordPress, you can log into an admin page and write your story in the text editor inside the webpage on your phone. But if you prefer to write stuff inside an offline text editor like VSCode, Hugo is your thing.


## Installation
Install hugo. The {{< mmaf "extended" false >}} flag indicates we need the Sass/SCSS parser.
{{< highlight plaintext >}}
# Windows (Use administrative PowerShell)
Set-ExecutionPolicy Bypass -Scope Process -Force; iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))
choco install hugo-extended -confirm

# MacOS
brew install hugo

# Linux
snap install hugo --channel=extended
{{< /highlight >}}


## Basic usage
The procedure follows the [official documentation](https://gohugo.io/getting-started/quick-start/).
### Create your site
Come up a name for your site. Let's say: {{< mmaf YourSite false >}}. And type
{{< highlight plaintext >}}
hugo new site YourSite
{{< /highlight >}}

You'll then get a folder with the following structure:
{{< highlight plaintext >}}
[nc]YourSite/
-- archetypes/        # content templates
-- content/           # content files
-- data/              # data files
-- layouts/           # templates
-- resources/         # resource files
-- static/            # static files
-- themes/            # themes
-- config.toml 
{{< /highlight >}}

### Add a theme
All themes are listed [here](https://themes.gohugo.io/). Once you find the theme you like, you can just download it and put it inside the {{< mmaf "themes" false >}} folder. In the {{< mmaf "config.toml" false >}} file, write the following configuration:
{{< highlight toml >}}
baseURL = "http://example.org/"
languageCode = "en-us"
title = "My New Hugo Site"
theme = "Name of the theme (should be the same as the folder name)"
{{< /highlight >}}


### Create a post
You can either create a markdown file manually, or use command
{{< highlight plaintext >}}
hugo new posts/my-first-post.md
{{< /highlight >}}

This will automatically prepare you with a ready-to-go markdown file with proper heading like this:
{{< highlight markdown >}}
---
title: "My First Post"
date: 2019-01-01T00:08:00
draft: true
---
Your content goes here...
{{< /highlight >}}

### Start the server locally
Use the command with flag {{< mmaf "-D" false >}} means hugo will also render those files with {{< mmaf "draft" false >}} set to {{< mmaf "true" false >}}.
{{< highlight plaintext >}}
hugo server -D
{{< /highlight >}}

Now by default, you can visit your site via {{< mmaf "localhost:1313" false >}}. Basically this will be your testing environment.

### Build the site
When you finish editing your content, you can build you static pages with simply
{{< highlight plaintext >}}
hugo
{{< /highlight >}}
There are some useful options:
{{< highlight plaintext >}}
-D      # include drafts (.md with draft: true)
-F      # include future (.md with date larger than today)
--gc    # clean up unused files from previous build
{{< /highlight >}}

Now you will find your pages inside the {{< mmaf "/public/" false >}} folder inside our project folder.

## Deploy your site
### Setup Nginx
I use Nginx server under Ubuntu 16.04. First install Nginx:
{{< highlight plaintext >}}
deb http://nginx.org/packages/ubuntu/ xenial nginx
deb-src http://nginx.org/packages/ubuntu/ xenial nginx
sudo apt update
sudo apt install nginx
{{< /highlight >}}

Back up the config file before we make any change
{{< highlight plaintext >}}
cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.backup
{{< /highlight >}}

Let's edit the global config file {{< mmaf "vim /etc/nginx/nginx.conf" false >}} 

{{< highlight nginx >}}
user www-data;
worker_processes auto;
pid /run/nginx.pid;
include /etc/nginx/modules-enabled/*.conf;

events {
  worker_connections 768;
}

http {
  # Basic Settings

  sendfile on;
  tcp_nopush on;
  tcp_nodelay on;

  keepalive_timeout 65;
  types_hash_max_size 2048;
  server_tokens off;

  include /etc/nginx/mime.types;
  default_type application/octet-stream;

  # Logging Settings

  access_log /var/log/nginx/access.log;
  error_log /var/log/nginx/error.log;

  # Gzip Settings

  gzip on;

  gzip_comp_level 6;
  gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

  # Virtual Host Configs

  include /etc/nginx/conf.d/*.conf;
  include /etc/nginx/sites-enabled/*;
}
{{< /highlight >}}

Then inside the {{< mmaf "/etc/nginx/sites-enabled/" false >}} folder, create a config file specifically for one site.
Say your domain name is {{< mmaf "yoursite.com" false >}}. Create a file {{< mmaf "yoursite.com.conf" false >}} with the following config:
{{< highlight nginx "hl_lines=6">}}
server {
  listen 80 default_server;
  listen [::]:80 default_server;
  server_name yoursite.com www.yoursite.com;
  
  root /var/www/html;
  index index.html;
}
{{< /highlight >}}
Note that the root directory is where we should put our webpages.

Restart Nginx after making all those changes
{{< highlight nginx >}}
nginx -s reload
service nginx restart
{{< /highlight >}}

### Upload static webpages
Now we need to upload the static webpages onto your server. This can be done using command line or any FTP software like [WinSCP](https://winscp.net/) on Windows or [CyberDuck](https://cyberduck.io/) on MacOS. Be sure to put the files in the same directory as in the config file.
