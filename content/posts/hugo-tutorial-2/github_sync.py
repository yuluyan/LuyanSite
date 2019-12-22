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