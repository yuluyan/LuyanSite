---
type: posts
draft: false

title: "Setup uWSGI to run python scripts via HTTP request"
subtitle: ""
date: 2019-01-25T18:00:00-06:00

authors:
  - me

preview:
  - What I want to achieve here is to run a python script on the server whenever a certain URL is requested, and possibly with some arguments passed to the python script.

tags:
  - Web
  - VPS

---
{{< oldpostflag >}}

What I want to achieve here is to run a python script on the server whenever a certain URL is requested, and possibly with some arguments passed to the python script. For example, when I enter the URL {{< mmaf "yuluyan.com/app?x=1&?y=2" false >}}, the python script will be called with two arguments {{< mmaf "x=1" false >}} and {{< mmaf "y=2" false >}}.

[uWSGI](https://uwsgi-docs.readthedocs.io/en/latest/), named after WSGI (Web Server Gateway Interface), is a complete solution for hosting services. But it also works with other servers like Nginx, which is perfect for my case. This post will cover the very basics of setup uWSGI with python on an Nginx server.


## Prerequisites
Upgrade the system:
{{< highlight plaintext >}}
sudo apt update
sudo apt upgrade
{{< /highlight >}}

Install C compiler and Python
{{< highlight plaintext >}}
apt install build-essential python-dev python-pip
{{< /highlight >}}

Install uWSGI through {{< mmaf pip false >}}
{{< highlight plaintext >}}
pip install uwsgi
{{< /highlight >}}

## Create python application
This is the example from the official documentation:
{{< highlight python >}}
# helloworld.py
def application(env, start_response):
    start_response('200 OK', [('Content-Type','text/html')])
    return [b"Hello World"]
{{< /highlight >}}

Save it as {{< mmaf "helloworld.py" false >}}.

## Configuration
Change the config file inside {{< mmaf "/etc/nginx/" false >}}. The following is a minimal example:
{{< highlight plaintext >}}
location /app/ {
    include uwsgi_params;
    uwsgi_pass 127.0.0.1:3905;
}
{{< /highlight >}}
It means: whenever the URL {{< mmaf "yuluyan.com/app/" false >}} is requested, it is passed to uWSGI. 
Now restart Nginx
{{< highlight plaintext >}}
sudo service nginx restart
{{< /highlight >}}

Start uWSGI (the port should match)
{{< highlight plaintext >}}
uwsgi --socket 127.0.0.1:3905 --wsgi-file ~/helloworld.py --master --processes 1 --threads 1
{{< /highlight >}}

or run it using screen:
{{< highlight plaintext >}}
screen -dmS uwsgi uwsgi --socket 127.0.0.1:3905 --wsgi-file ~/helloworld.py --master --processes 1 --threads 1
{{< /highlight >}}

A better way would be using {{< mmaf ".json" false >}} or {{< mmaf ".ini" false >}} config files:
{{< highlight ini >}}
# config.ini
[uwsgi]
# socket = addr:port
socket = 127.0.0.1:3905

# The python application file
wsgi-file = helloworld.py

# master = [master process (true of false)]
master = true

# processes = [number of processes]
processes = 1

# threads = [number of threads]
threads = 1
{{< /highlight >}}

and run with it
{{< highlight plaintext >}}
screen -dmS uwsgi uwsgi --ini config.ini
{{< /highlight >}}

Now if you enter URL {{< mmaf "yuluyan.com/app" false >}}, a page with {{< mmaf "Hello World" false >}} will show up.



## WSGI basics
The following code shows the environment variable passed to the python script.
{{< highlight python >}}
def application (env, start_response):
    response = '<h2>Content in environment variable</h2>' + '\n'.join([
        '<p><span style="font-weight: bold;">%s</span>: %s</p>' % (k, v) for k, v in sorted(env.items())
    ])
    start_response('200 OK', [('Content-Type','text/html')])
    return [response]
{{< /highlight >}}

When the URL {{< mmaf "yuluyan.com/app/func?x=1&y=2" false >}} is requested, the content of the environment variable is set correspondingly.
The following shows the keys that are important to us. 
{{< highlight plaintext "hl_lines=5-6" >}}
[nc]Content in environment variable
CONTENT_LENGTH:
CONTENT_TYPE:
... ...
PATH_INFO: /app/func
QUERY_STRING: x=1&y=2
... ...
REQUEST_METHOD: GET
REQUEST_SCHEME: https
REQUEST_URI: /app/func?x=1&y=2
SERVER_NAME: yuluyan.com
... ...
{{< /highlight >}}

For our case, we only need to take care of the two keys {{< mmaf "PATH_INFO" false >}} and {{< mmaf "QUERY_STRING" false >}}.
{{< mmaf "PATH_INFO" false >}} can be processed by simply {{< mmaf "split" false >}} while {{< mmaf "QUERY_STRING" false >}} can be processed by 
{{< mmaf "parse_qs" false >}} function from library {{< mmaf "urlparse" false >}}.
The following script is an example of how to use them:
{{< highlight python >}}
from urlparse import parse_qs

def application (env, start_response):
    path_info = env.get('PATH_INFO', '').strip('/').split('/')
    query_string = parse_qs(env.get('QUERY_STRING', ''))

    response = '<h4>PATH_INFO</h4>' + '[' + ', '.join(path_info) + ']'
    response += '<h4>QUERY_STRING</h4>' + '\n'.join([
      "%s: %s" % (k, '[' + ', '.join(v) + ']') for k, v in query_string.items()
    ])

    start_response('200 OK', [('Content-Type','text/html')])
    return [response]
{{< /highlight >}}

If we enter the URL
{{< highlight plaintext >}}
[nc]yuluyan.com/app/path1/path2/path3/func?x=1&y=2&z=3&x=4
{{< /highlight >}}

we will get the following result:
{{< highlight plaintext "hl_lines=5-6" >}}
[nc]PATH_INFO
[app, path1, path2, path3, func]
QUERY_STRING
y: [2] x: [1, 4] z: [3]
{{< /highlight >}}


## Dispatch function calls
Here is a toy implementation of a function dispatcher. 
In the {{< mmaf config false >}} dictionary, the key is the url path and the value is the function to be called.
{{< highlight python >}}
from urlparse import parse_qs

# if use python version >3.3, use
# from inspect import signature
from funcsigs import signature

def func1(t):
    return "You've input " + t

def func2(x, y):
    return int(x) + int(y)

def application(env, start_response):
    config = {
        'app/func1': func1,
        'app/func2': func2
    }
    try:
        result = Dispatcher(config)(env)
        response = 'The result is ' + str(result)
    except ValueError as e:
        response = '<span style="color:red;">Error: ' + str(e) + '</span>'

    start_response('200 OK', [('Content-Type', 'text/html')])
    return [response]


class Dispatcher():
    def __init__(self, config):
        self.config = {}
        for path, func in config.items():
            self.config[path.strip('/')] = {
                'function': func,
                'arguments': [ param.name for param in signature(func).parameters.values()]
            }

    def __call__(self, env):
        path = env.get('PATH_INFO', '').strip('/')
        query_string = parse_qs(env.get('QUERY_STRING', ''))

        if path in self.config:
            args = []
            for param in self.config[path]['arguments']:
                if param in query_string:
                    args.append(query_string[param][0])
                else:
                    raise ValueError('No argument named %s provided!' % param)
            return self.config[path]['function'](*args)
        else:
            raise ValueError('No matched function at path %s!' % path)
{{< /highlight >}}

Let's test it!
{{< highlight plaintext >}}
[nc]yuluyan.com/app/func1?t=some+text
# The result is You've input some text

yuluyan.com/app/func1?x=some+text
# Error: No argument named t provided!

yuluyan.com/app/func1?t=some+text&x=nonsense
# The result is You've input some text

yuluyan.com/app/func2?x=1&y=2
# The result is 3

yuluyan.com/app/func2?x=1&z=2
# Error: No argument named y provided!

yuluyan.com/app/func2?x=1&z=2&y=3
# The result is 4

yuluyan.com/app/func2?x=1&y=b
# Error: invalid literal for int() with base 10: 'b'

yuluyan.com/app/func3
# Error: No matched function at path app/func3!

yuluyan.com/app/foobar/func3?x=3
# Error: No matched function at path app/foobar/func3!
{{< /highlight >}}

It works well for this simple case. But be sure not to allow dangerous things in the functions!
For more complex use case, there are plenty of frameworks available, e.g., Django, Flask, etc..