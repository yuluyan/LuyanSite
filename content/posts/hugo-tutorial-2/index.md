---
type: posts
draft: false

title: "Deploying Hugo using GitHub webhook"
subtitle: "&mdash; Hugo static site generator walk-through (2)"
date: 2019-12-20T18:00:00-06:00

authors:
  - me

preview:
  - Last post talked about how to build a Hugo site from scratch. If you do not plan to update the site frequently, you can just locally build the site and upload it via command line or any FTP software like WinSCP on Windows or CyberDuck on MacOS. The procedure goes like...

tags:
  - Web
---

[Last post]({{< ref "posts/hugo-tutorial" >}}) talked about how to build a Hugo site from scratch. If you do not plan to update the site frequently, you can just locally build the site and upload it via command line or any FTP software like [WinSCP](https://winscp.net/) on Windows or [CyberDuck](https://cyberduck.io/) on MacOS. The procedure goes like this:
{{< figure src="before_github.png#center" width="270">}}

1. Modify your site (posts, images, etc.) locally;
2. Build the site locally;
3. Upload the {{< f "/public" >}} folder to your server.

However, if updating the site is kind of a daily thing, you definitely don't want to do the FTP uploading every time. Let along the inconvenience it brings, you are uploading many redundant files to the server and it will take a long time if your site gets big. Using GitHub's [webhook](https://developer.github.com/webhooks/), we can achieve something like this:
{{< figure src="after_github.png#center" width="450">}}

1. Create a GitHub repo for your Hugo site;
2. **Commit a change to the repo;**
3. GitHub sends an message through HTTP request to your server;
4. Your server receives the message and fetch the newest GitHub repo of your site;
5. Your server builds the site using Hugo --- Done!

OK now it seems the process is even more complicated, which is true. But the key here is that Step 1 and 3-5 are setup once and forever! Basically this makes GitHub your website control panel and you can use any editor that with GitHub integration (for example, VSCode) to manage the content of your website --- lively! Another benefit is that you automatically get all the version control via GitHub. Let's get started.

## Prerequisites
A running web server with uWSGI configured. See my [other post]({{< ref "posts/uwsgi-server" >}}) on how to do this.


## Server side setup
Update and upgrade the server
{{< highlight plaintext >}}
apt update
apt upgrade
{{< /highlight >}}

Install Hugo on the server
{{< highlight plaintext >}}
snap install hugo --channel=extended
{{< /highlight >}}


Generate an ssh key pair for later use by
{{< highlight plaintext >}}
ssh-keygen
{{< /highlight >}}

Here I name it {{< f "github_sync" >}}.
Print the public key and copy it (change the dir if you didn't keep the default).
{{< highlight plaintext >}}
cat ~/.ssh/github_sync.pub
{{< /highlight >}}

Create or modify the ssh config file {{< f "~/.ssh/config" >}} to specify which key to use for the git command.
{{< highlight plaintext >}}
# ~/.ssh/config
Host github.com
  User git
  IdentityFile /root/.ssh/github_sync
  IdentitiesOnly yes
{{< /highlight>}}


## GitHub side setup
### Create a repo
Create a repo and push all your files of the Hugo sites to it.

### Add a webhook
In the Settings tab of your repository, click on the **Webhooks** section on the left side and add a webhook. The **Payload URL** is the URL that GitHub will request your server whenever there is a push event. Here, I it set to {{< f "www.yuluyan.com/app/github_sync" >}}. 

Choose the **Content type** to be {{< f "application/json" >}} so the push event details will be sent to your server in the format of JSON. (You can choose the other one as well and the details will be sent in the format of a form. It's just a matter of different parsing method.)

In **Secret**, you should enter a secret string that will be used during the validation process. I will talk about this later. Let's say the secret string you set is
{{< f "your_github_sync_secret" >}}.

You can leave all other fields default.
{{< figure src="github_webhook.png#center" width="560">}}


### Add an SSH key
In the account setting page (click your avatar on top-right corner), go to the **SSH and GPG keys** section and click **New SSH key**.
Give the key a name and paste the just copied public key to the textbox.
{{< figure src="github_ssh.png#center" width="560">}}


## Server side setup, again
### Clone the repo
Test the connection to GitHub by
{{< highlight plaintext >}}
ssh -T git@github.com
{{< /highlight>}}

If you see something like this, your connect is good.
{{< highlight plaintext >}}
[nc]Hi username! You've successfully authenticated, but GitHub does not provide shell access.
{{< /highlight >}}

Make a folder to be your application folder
{{< highlight plaintext >}}
mkdir ~/uwsgi_apps/github_sync
cd ~/uwsgi_apps/github_sync
{{< /highlight>}}

Clone the GitHub repo the the server (change the name for your case)
{{< highlight plaintext >}}
git clone git@github.com:username/YourSite.git
{{< /highlight>}}

Move the repo into a folder called {{< f "build" >}}
{{< highlight plaintext >}}
mv YourSite build
{{< /highlight>}}

### Store the GitHub secret as environment variable
Create a file to store the GitHub secret string you just set.
{{< highlight plaintext >}}
vim ~/uwsgi_apps/github_sync/github_sync_secret
{{< /highlight>}}

Write the following content in to the file
{{< highlight plaintext >}}
export GITHUB_SYNC_SECRET="your_github_sync_secret"
{{< /highlight>}}

Evaluate it
{{< highlight plaintext >}}
source ~/uwsgi_apps/github_sync/github_sync_secret
{{< /highlight>}}


### uWSGI application
Now we create a python script called {{< f "github_sync.py" py "github_sync.py" >}} that parses the GitHub request. 
The lines with highlight should be changed according to your configuration.
{{< highlight python >}}
# ~/uwsgi_apps/github_sync/github_sync.py
import hmac, hashlib
import os, json, re
# pip install python-dateutil==1.4
from dateutil import parser

# The GitHub Payload URL path
request_path = '/app/github_sync'

# The www dir of the server
server_dir = '/var/www/html'

# The repo path on server
build_dir = '/root/uwsgi_apps/github_sync/build'

build_public_dir = build_dir + '/public'

def application(env, start_response):
  response_status = '200 OK'
  response_body = 'Receive github push event.\n'
  # Check if it's POST and if the request path is correct
    if env.get('REQUEST_METHOD', 0) != 'POST' or env.get('PATH_INFO', 0) != request_path:
        # not POST or not correct path
        response_status = 'Forbidden 403'
        response_body += 'Invalid github request.\n'

        start_response(response_status, [('Content-Type', 'text/html')])
        return [response_body]
    else:
        # Get the github payload body
        content_length = int(env.get('CONTENT_LENGTH', 0))
        if content_length != 0:
            payload_body = env['wsgi.input'].read(content_length)
            response_body += 'Get the payload JSON.\n'
        else:
            response_status = '503 Service Unavailable'
            response_body += 'Github did not send payload JSON.\n'
            start_response(response_status, [('Content-Type', 'text/html')])
            return [response_body]

        # Get server secret from environment variable
        secret = os.environ.get('GITHUB_SYNC_SECRET')
        if secret == None:
            response_status = '500 Internal Server Error'
            response_body += 'Server does not have github secret.\n'
            start_response(response_status, [('Content-Type', 'text/html')])
            return [response_body]

        response_body += 'Server has github secret.\n'

        # Validate github signature
        hub_signature = env.get('HTTP_X_HUB_SIGNATURE', '')
        signature = 'sha1=' + hmac.new(secret, payload_body, hashlib.sha1).hexdigest()
        if not hmac.compare_digest(signature, hub_signature):
            response_status = 'Forbidden 403'
            response_body += 'Signatures not match.\n'
            start_response(response_status, [('Content-Type', 'text/html')])
            return [response_body]

        response_body += 'Signature validated.\n'

        # JSONify    
        payload_body = json.loads(payload_body)

        # Make logs and keep track of commit id
        commit_message = ''
        commit_id = ''
        if 'commits' in payload_body and len(payload_body['commits']) > 0:
            # Get the last commit
            last_id = 0
            last_timestamp = parser.parse(payload_body['commits'][0]['timestamp'])
            for cur_id, commit in enumerate(payload_body['commits']):
                cur_timestamp = parser.parse(commit['timestamp'])
                if cur_timestamp > last_timestamp:
                    last_id = cur_id
                    last_timestamp = cur_timestamp
            # Get the last commit message
            commit_message = payload_body['commits'][last_id]['message']
            commit_id = payload_body['commits'][last_id]['id']
            response_body += ('---Commit Message---\n' + commit_message + '\n')
            response_body += ('---Commit Id---\n' + commit_id + '\n')

        # Reset repo
        command = 'cd ' + build_dir + ' && git fetch --all && git reset --hard origin/master'
        response_body += ('Run command: ' + command + '\n')
        command_ret = os.system(command)
        if command_ret != 0:
            response_body += ('Run command failed.\n')
            start_response('500 Internal Server Error', [('Content-Type', 'text/html')])
            return [response_body]
        # Save commit id to local file for hugo use
        if commit_id != '':
            command = 'cd ' + build_dir + ' && echo "' + commit_id + '" > commit_id.txt'
            response_body += ('Run command: ' + command + '\n')
            command_ret = os.system(command)
            if command_ret != 0:
                response_body += ('Run command failed.\n')
                start_response('500 Internal Server Error', [('Content-Type', 'text/html')])
                return [response_body]
        # Hugo build
        command = 'cd ' + build_dir + ' && ' + parse_commit_message(commit_message)
        response_body += ('Run command: ' + command + '\n')
        command_ret = os.system(command)
        if command_ret != 0:
            response_body += ('Run command failed.\n')
            start_response('500 Internal Server Error', [('Content-Type', 'text/html')])
            return [response_body]
        # Copy to server
        command = 'cd ' + build_dir + ' && cp -r ' + build_public_dir + '/. ' + server_dir
        response_body += ('Run command: ' + command + '\n')
        command_ret = os.system(command)
        if command_ret != 0:
            response_body += ('Run command failed.\n')
            start_response('500 Internal Server Error', [('Content-Type', 'text/html')])
            return [response_body]

        print(response_status)
        print(response_body)

        start_response(response_status, [('Content-Type', 'text/html')])
        return [response_body]


# Simple parser to allow certain options of hugo build
# Message looks like this
# commit_message = """
# Commit title
# 
# Commit message string
# [[hugo-options -D --gc]]
# Commit message string
# """
def check_hugo_options(options):
    # Do nothing for now
    return True

def parse_commit_message(commit_message):
    try:
        options = re.search('\[\[hugo-options ([^]]+)\]\]', commit_message).group(1)
    except AttributeError:
        options = ''

    if check_hugo_options(options):
        return 'hugo ' + options
    else:
        return 'hugo'
{{< /highlight>}}

What this script does is outlined here:

1. Check the request URL and method (POST);
2. Then get the GitHub payload JSON;
3. Validate the {{< f "sha1" >}} hash according to the [documentation](https://developer.github.com/webhooks/securing/);
4. Get the commit message and and look for Hugo command options;
5. Fetch the repo and build the site.

Then we are ready to run the uWSGI server (See details in my [other post]({{< ref "posts/uwsgi-server" >}})).
Create an config file {{< f "github_sync.ini" >}} 
{{< highlight ini >}}
# github_sync.ini
[uwsgi]
socket = 127.0.0.1:3905
wsgi-file = github_sync.py
master = true
processes = 1
{{< /highlight>}}

Use uWSGI with the config file using the command
{{< highlight plaintext >}}
uwsgi --ini github_sync.ini
{{< /highlight>}}

## Let's do a test!
Make some commit on your repo. If you want to run hugo with certain options, you can put it in the message like this
{{< figure src="commit.png#center" width="560">}}

If everything is configured correctly, you should see messages like this on your server
{{< highlight plaintext >}}
[nc]Fetching origin
remote: Enumerating objects: 5, done.
remote: Counting objects: 100% (5/5), done.
remote: Compressing objects: 100% (2/2), done.
remote: Total 3 (delta 1), reused 0 (delta 0), pack-reused 0
Unpacking objects: 100% (3/3), done.
From github.com:yuluyan/LuyanSite
   b415a72..1800af3  master     -> origin/master
HEAD is now at 1800af3 Test Commit

                   | EN
+------------------+----+
  Pages            |  7
  Paginator pages  |  0
  Non-page files   | 10
  Static files     | 19
  Processed images |  0
  Aliases          |  0
  Sitemaps         |  1
  Cleaned          |  0

Total in 1277 ms
200 OK
Receive github push event.
Get the payload JSON.
Server has github secret.
Signature validated.
---Commit Message---
Test Commit

This is a test.
[[hugo-options -D --gc]]
This is a test.
---Commit Id---
1800af34a394abe6c1d94df7c3c1efb62781a498
Run command: cd /root/uwsgi_apps/github_sync/build && git fetch --all && git reset --hard origin/master
Run command: cd /root/uwsgi_apps/github_sync/build && echo "1800af34a394abe6c1d94df7c3c1efb62781a498" > commit_id.txt
Run command: cd /root/uwsgi_apps/github_sync/build && hugo -D --gc
Run command: cd /root/uwsgi_apps/github_sync/build && cp -r /root/uwsgi_apps/github_sync/build/public/. /var/www/html
{{< /highlight >}}

## Display the commit id on the page (optional)
You may have noticed that in the script, I saved the commit id as a text file {{< f "commit_id.txt" >}} on the server.
This allows Hugo to display the id on the webpage as a nice little detail :) You can scroll to the bottom of this page and see the result.

This is very easy with Hugo template. First you should add to your {{< f "config.toml" >}} file the address of github
{{< highlight toml >}}
[params]
  ...
  githubRepo = "https://github.com/username/YourSite"
{{< /highlight >}}

Assume you have a footer template {{< f "footer.html" >}}. Add the following HTML will enable Hugo to read the commit id from the text file and show it on the page.
{{< highlight html "hl_lines=3-9" >}}
<div class="footer wrapper">
  ...
  {{ if (fileExists "commit_id.txt") }}
  {{ $commit_id := trim (readFile "commit_id.txt") "\n" }}
  Github commit: 
  <a class="github-commit-sha" 
     href="{{- .Site.Params.githubRepo -}}/commit/{{- $commit_id -}}" 
     target="_blank">{{ substr $commit_id 0 7 }}</a>
  {{ end }}
  Updated on {{ now.Format "January 2, 2006"}}
  ...
</div>
{{< /highlight >}}

Here are some CSS to give it a GitHub-style appearance:
{{< highlight CSS >}}
.github-commit-sha {
  font-family: SFMono-Regular, Consolas, Liberation Mono, Menlo, monospace;
  padding: 0.1em 0.4em;
  font-size: 90%;
  font-weight: 400;
  background-color: #f6f8fa;
  border: 1px solid #eaecef;
  border-radius: 0.2em;
}
{{< /highlight >}}