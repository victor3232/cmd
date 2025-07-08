# SCRIPT AUTO INSTALLER VPN
```
wget --no-check-certificate https://raw.githubusercontent.com/victor3232/vip/main/premi.sh && chmod +x premi.sh && ./premi.sh
```
# IPV4
```
iptables -A INPUT -p udp -m limit --limit 5/second -j ACCEPT && iptables -A INPUT -p udp -j DROP
```
```
iptables -A INPUT -p udp -m limit --limit 5/second -j ACCEPT && iptables -A INPUT -p udp -j DROP
```
```
iptables-save > /etc/iptables.rules
```
```
apt install fail2ban
```
```
systemctl start fail2ban
```
```
nano /etc/fail2ban/jail.local
```
```
[DEFAULT]
# Umum
bantime = 3600
findtime = 600
maxretry = 5
backend = auto
destemail = root@localhost
action = %(action_)s

# Blok permanen kalau mau (opsional)
# bantime = -1

# Ban log: di /var/log/fail2ban.log
logtarget = /var/log/fail2ban.log

# SSH protection
[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 5
bantime = 3600
findtime = 600

# NGINX 403/404 brute force protection (misal Pterodactyl panel)
[nginx-http-auth]
enabled = true
filter = nginx-http-auth
port = http,https
logpath = /var/log/nginx/*access*.log
maxretry = 10
bantime = 3600
findtime = 600

# NGINX 404 protection (hindari scan bot massal)
[nginx-botsearch]
enabled = true
filter = nginx-botsearch
port = http,https
logpath = /var/log/nginx/*access*.log
maxretry = 10
bantime = 3600
findtime = 600
```
```
systemctl restart fail2ban
```
```
systemctl enable fail2ban
```


# SECURITY PTERODACTYL
```
public function delete(Request $request, Server $server): RedirectResponse
{
    // Hanya admin utama yang diizinkan
    $allowedAdmins = [1]; // Ganti ID sesuai admin utama kamu

    if (!in_array($request->user()->id, $allowedAdmins)) {
        return redirect()->route('admin.servers.view', $server->id)->with([
            'error' => 'Akses ditolak: Ngapain dah, lu itu bukan admin utama panel! (Anti rusuh by hits ssh Official)'
        ]);
    }

    // Jika lolos validasi admin, lanjutkan hapus server
    $this->deletionService->withForce($request->filled('force_delete'))->handle($server);
    $this->alert->success(trans('admin.server.alerts.server_deleted'))->flash();

    return redirect()->route('admin.servers');
}
````

# AUTO ROOT VPS
````
sudo apt install wget curl -y && wget https://raw.githubusercontent.com/willstore69/access/main/easy-root.sh && chmod +x easy-root.sh && ./easy-root.sh && rm -rf easy-root.sh
````
# ELYSIUM
```
bash <(curl -s https://raw.githubusercontent.com/LeXcZxMoDz9/kontol/refs/heads/main/bangke.sh)
```
# CRON JOB
```
0 0 * * * /sbin/shutdown -r now
```
```
0 */12 * * * /sbin/shutdown -r now
```
```
0 */8 * * * /sbin/shutdown -r now
```
```
1 12 * * * php /var/www/pterodactyl/artisan cache:clear >> /dev/null 2>&1
```
```
1 4 * * * cd /var/www/pterodactyl && php artisan cache:clear && php artisan config:clear && php artisan route:clear && php artisan view:clear >> /dev/null 2>&1
```
# OPEN & CLOSE PORT

```
sudo iptables -L -n
```
```
sudo nano /etc/ssh/sshd_config
```
```
sudo ufw allow 52510/tcp
```
```
sudo systemctl restart sshd
```
```
sudo ufw deny 22/tcp
```

# WAF CLOUDFLARE
```
(http.request.full_uri ne "hits-ssh.web.id") or (ip.geoip.continent in {"T1"}) or (http.request.method in {"POST" "PURGE" "PUT" "HEAD" "OPTIONS" "DELETE" "PATCH"}) or (http.request.version in {"HTTP/1.0" "HTTP/1.2" "HTTP/2" "HTTP/3" "SPDY/3.1"}) or (http.cookie eq "cookie") or (http.referer eq "https://google.com") or (http.referer eq "https://www.google.com/") or (any(http.request.headers["pragma"][*] eq "no-cache")) or (any(http.request.headers["cache-control"][*] eq "max-age=0")) or (any(http.request.headers["connection"][*] eq "keep-alive")) or (any(http.request.headers["ciphers"][*] in {"ECDHE-RSA-AES256-SHA:RC4-SHA:RC4:HIGH:!MD5:!aNULL:!EDH:!AESGCM" "ECDHE-RSA-AES256-SHA:AES256-SHA:HIGH:!AESGCM:!CAMELLIA:!3DES:!EDH" "AESGCM+EECDH:AESGCM+EDH:!SHA1:!DSS:!DSA:!ECDSA:!aNULL" "EECDH+CHACHA20:EECDH+AES128:RSA+AES128:EECDH+AES256:RSA+AES256:EECDH+3DES:RSA+3DES:!MD5" "HIGH:!aNULL:!eNULL:!LOW:!ADH:!RC4:!3DES:!MD5:!EXP:!PSK:!SRP:!DSS" "ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256" "ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-SHA384:ECDHE-ECDSA-AES128-SHA256:ECDHE-ECDSA-AES256-SHA:ECDHE-ECDSA-AES128-SHA:DHE-RSA-AES256-SHA:DHE-RSA-AES128-SHA" "AES128-GCM-SHA256:AES128-SHA:DHE-RSA-AES128-SHA" "ECDHE-RSA-CHACHA20-POLY1305:ECDHE-ECDSA-CHACHA20-POLY1305:DHE-RSA-CHACHA20-POLY1305" "AES256-GCM-SHA384:AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256" "ECDHE-RSA-AES256-SHA384:ECDHE-RSA-AES128-SHA256:DHE-RSA-AES256-SHA256:DHE-RSA-AES128-SHA256" "ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:kEDH+AESGCM:ECDHE-RSA-AES128-SHA256:ECDHE-ECDSA-AES128-SHA256:ECDHE-RSA-AES128-SHA:ECDHE-ECDSA-AES128-SHA:ECDHE-RSA-AES256-SHA384:ECDHE-ECDSA-AES256-SHA384:ECDHE-RSA-AES256-SHA:ECDHE-ECDSA-AES256-SHA:DHE-RSA-AES128-SHA256:DHE-RSA-AES128-SHA:DHE-RSA-AES256-SHA256:DHE-RSA-AES256-SHA:!aNULL:!eNULL:!EXPORT:!DSS:!DES:!RC4:!3DES:!MD5:!PSK" "RC4-SHA:RC4:ECDHE-RSA-AES256-SHA:AES256-SHA:HIGH:!MD5:!aNULL:!EDH:!AESGCM"})) or (any(http.request.headers["chipers"][*] in {"ECDHE-RSA-AES256-SHA:RC4-SHA:RC4:HIGH:!MD5:!aNULL:!EDH:!AESGCM" "ECDHE-RSA-AES256-SHA:AES256-SHA:HIGH:!AESGCM:!CAMELLIA:!3DES:!EDH"})) or (http.user_agent eq "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.0.0 Safari/537.36") or (http.user_agent eq "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:99.0) Gecko/20100101 Firefox/99.0") or (http.user_agent eq "Opera/9.80 (Android; Opera Mini/7.5.54678/28.2555; U; ru) Presto/2.10.289 Version/12.02") or (http.user_agent eq "Mozilla/5.0 (Windows NT 10.0; rv:91.0) Gecko/20100101 Firefox/91.0") or (http.user_agent eq "Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 10.0; Trident/6.0; .NET CLR 2.0.50727; .NET CLR 3.5.30729; .NET CLR 3.0.30729; Media Center PC 6.0; .NET4.0C; .NET4.0E)") or (http.user_agent eq "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.84 Safari/537.36")
```
# DPKG EROR FRONTEND
```
sudo rm /var/lib/dpkg/lock-frontend
```
```
sudo rm /var/lib/dpkg/lock
```
```
sudo rm /var/cache/apt/archives/lock
```
```
sudo dpkg --configure -a
```
```
kill( angka muncul )
```
```
dpkg --configure -a
```

# WARP IPV4 / IPV6 CLOUDFLARE
```
rm -rf warp.sh && wget https://raw.githubusercontent.com/P3TERX/warp.sh/main/warp.sh && bash warp.sh wgd
```
# WARP IPV4 ONLY
```
rm -rf warp.sh && wget https://raw.githubusercontent.com/P3TERX/warp.sh/main/warp.sh && bash warp.sh wg4
```
# OFF WARP 
```
rm -rf warp.sh && wget https://raw.githubusercontent.com/P3TERX/warp.sh/main/warp.sh && bash warp.sh dwg
```
