---
type: posts
draft: false

title: "Complete setup of Shadowsocks (2)"
subtitle: "Security and optimization"
date: 2017-02-19T18:00:00-06:00

authors:
  - me

preview:
  - This is the continuation of the last post and is about the security and optimizations.

tags:
  - VPS
---
{{< oldpostflag >}}

This is the continuation of the last post and is about the security and optimizations.
## Security
Use {{< f iptables  >}} to allow only necessary ports:
{{< highlight plaintext >}}
# Delete all rules
iptables --flush
iptables --delete-chain
iptables --table mangle --flush
iptables --table mangle --delete-chain

# Allow SSH, HTTP, HTTPS
iptables --append INPUT --protocol tcp --dport 22 -j ACCEPT
iptables --append INPUT --protocol tcp --dport 80 -j ACCEPT
iptables --append INPUT --protocol tcp --dport 443 -j ACCEPT

# Allow Shadowsocks port
iptables --append INPUT -p tcp --match multiport --dports 50000:50100 -j ACCEPT

# Allow Shadowsocks-manager port
iptables --append INPUT -p tcp --match multiport --dports 6000:6005 -j ACCEPT

# Allow valid inputs
iptables --append INPUT --match conntrack --ctstate ESTABLISHED,RELATED --jump ACCEPT

# Default rules
iptables --policy INPUT DROP
iptables --policy OUTPUT ACCEPT
iptables --policy FORWARD DROP

# Save
iptables-save > /etc/iptables_rules
echo "/sbin/iptables-restore < /etc/iptables_rules" >> /etc/rc.local
{{< /highlight>}}



## Optimizations

### Update 12-15-2019
Enable BBR optimization:
{{< highlight plaintext >}}
git clone https://github.com/yuluyan/ss-fly.git
ss-fly/ss-fly.sh -bbr
{{< /highlight>}}

Test if it works:
{{< highlight plaintext >}}
sysctl net.ipv4.tcp_available_congestion_control
{{< /highlight>}}

The return value should be 
{{< highlight plaintext >}}
net.ipv4.tcp_available_congestion_control = bbr cubic reno
{{< /highlight>}}


## Other
The webgui front-end is in directory
{{< highlight plaintext >}}
/usr/local/node/lib/node_modules/shadowsocks-manager/plugins/webgui/public
{{< /highlight>}}
