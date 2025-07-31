# JAIL.CONF
```
#!/bin/bash
# ==========================================
# ✅ ANTI DDOS L4 + L7 (FAIL2BAN + IPTABLES + NGINX RATE LIMIT)
# ✅ AMAN UNTUK PANEL PTERODACTYL, WINGS & SSH
# ==========================================

echo "[1/9] Update & Install paket..."
apt update -y
apt install fail2ban nginx iptables-persistent curl -y

echo "[2/9] Backup konfigurasi lama..."
cp /etc/fail2ban/jail.local /etc/fail2ban/jail.local.bak-$(date +%F-%H%M) 2>/dev/null || true
cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.bak-$(date +%F-%H%M)
iptables-save > /root/iptables-backup-$(date +%F-%H%M).rules

echo "[3/9] Konfigurasi Fail2ban..."
cat > /etc/fail2ban/jail.local <<'EOL'
[DEFAULT]
ignoreip = 127.0.0.1/8 10.0.0.0/8 192.168.0.0/16
bantime = 3600
findtime = 600
maxretry = 5
backend = auto
destemail = root@localhost
action = %(action_mw)s
logtarget = /var/log/fail2ban.log

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
port = http,https
logpath = /var/log/nginx/access.log

[nginx-botsearch]
enabled = true
filter = nginx-botsearch
port = http,https
logpath = /var/log/nginx/access.log

[nginx-http-flood]
enabled = true
port = http,https
filter = nginx-http-flood
logpath = /var/log/nginx/access.log
maxretry = 100
findtime = 60
bantime = 600
mode = aggressive

[nginx-badbots]
enabled = true
port = http,https
filter = nginx-badbots
logpath = /var/log/nginx/access.log
maxretry = 5
bantime = 86400

[recidive]
enabled = true
logpath = /var/log/fail2ban.log
bantime = 86400
findtime = 86400
maxretry = 5
EOL

echo "[4/9] Buat filter HTTP Flood..."
cat > /etc/fail2ban/filter.d/nginx-http-flood.conf <<'EOL'
[Definition]
failregex = ^<HOST> -.*"(GET|POST).*HTTP.*" (404|444|503|429)
ignoreregex =
EOL

echo "[5/9] Tambahkan Rate Limiting di NGINX..."
if ! grep -q "limit_req_zone" /etc/nginx/nginx.conf; then
sed -i '/http {/a \    limit_req_zone $binary_remote_addr zone=req_limit_per_ip:10m rate=10r/s;\n    limit_conn_zone $binary_remote_addr zone=conn_limit_per_ip:10m;' /etc/nginx/nginx.conf
fi

echo "[6/9] Tambah konfigurasi rate limit ke server block default..."
DEFAULT_CONF="/etc/nginx/sites-available/default"
if [ -f "$DEFAULT_CONF" ]; then
  if ! grep -q "limit_req" "$DEFAULT_CONF"; then
    sed -i '/location \/ {/a \        limit_req zone=req_limit_per_ip burst=20 nodelay;\n        limit_conn conn_limit_per_ip 20;' "$DEFAULT_CONF"
  fi
fi

echo "[7/9] Konfigurasi iptables aman & stabil..."
iptables -F
iptables -X

iptables -A INPUT -i lo -j ACCEPT
iptables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT

iptables -N SYN_FLOOD
iptables -A SYN_FLOOD -p tcp --syn -m limit --limit 1/s --limit-burst 3 -j RETURN
iptables -A SYN_FLOOD -j DROP
iptables -A INPUT -p tcp --syn -j SYN_FLOOD

iptables -A INPUT -p tcp --tcp-flags ALL NONE -j DROP
iptables -A INPUT -p tcp --tcp-flags ALL ALL -j DROP

iptables -A INPUT -p tcp --dport 22 -j ACCEPT
iptables -A INPUT -p tcp --dport 80 -j ACCEPT
iptables -A INPUT -p tcp --dport 443 -j ACCEPT
iptables -A INPUT -p tcp --dport 8080 -j ACCEPT
iptables -A INPUT -p tcp --dport 25565 -j ACCEPT
iptables -A INPUT -p udp --dport 25565 -j ACCEPT
iptables -A INPUT -p tcp --dport 5000:5500 -j ACCEPT
iptables -A INPUT -p udp --dport 5000:5500 -j ACCEPT

iptables -A INPUT -p icmp --icmp-type echo-request -m limit --limit 1/s -j ACCEPT
iptables -A INPUT -m conntrack --ctstate INVALID -j DROP

iptables -A INPUT -j DROP

iptables-save > /etc/iptables/rules.v4
netfilter-persistent save

echo "[8/9] Restart semua layanan..."
systemctl restart fail2ban
nginx -t && systemctl reload nginx

echo "[9/9] Selesai!"
echo "==========================================="
echo "✅ Anti-DDoS L4 + L7 AKTIF!"
echo "✅ Rate Limit NGINX diaktifkan"
echo "✅ Web, SSH, Panel tetap aman"
echo "Cek jail:     fail2ban-client status"
echo "Cek iptables: iptables -L -n"
echo "==========================================="
```
# FIX JAIL
```
#!/bin/bash
# ==========================================
# ✅ ANTI DDOS L4 + L7 (FAIL2BAN + IPTABLES + NGINX RATE LIMIT)
# ✅ AMAN UNTUK PANEL PTERODACTYL, WINGS & SSH
# ==========================================

echo "[1/9] Update & Install paket..."
apt update -y
apt install fail2ban nginx iptables-persistent curl -y

echo "[2/9] Backup konfigurasi lama..."
cp /etc/fail2ban/jail.local /etc/fail2ban/jail.local.bak-$(date +%F-%H%M) 2>/dev/null || true
cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.bak-$(date +%F-%H%M)
iptables-save > /root/iptables-backup-$(date +%F-%H%M).rules

echo "[3/9] Konfigurasi Fail2ban..."
cat > /etc/fail2ban/jail.local <<'EOL'
[DEFAULT]
ignoreip = 127.0.0.1/8 10.0.0.0/8 192.168.0.0/16
bantime = 3600
findtime = 600
maxretry = 5
backend = auto
destemail = root@localhost
action = %(action_mw)s
logtarget = /var/log/fail2ban.log

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
port = http,https
logpath = /var/log/nginx/access.log

[nginx-botsearch]
enabled = true
filter = nginx-botsearch
port = http,https
logpath = /var/log/nginx/access.log

[nginx-http-flood]
enabled = true
port = http,https
filter = nginx-http-flood
logpath = /var/log/nginx/access.log
maxretry = 100
findtime = 60
bantime = 600
mode = aggressive

[nginx-badbots]
enabled = true
port = http,https
filter = nginx-badbots
logpath = /var/log/nginx/access.log
maxretry = 5
bantime = 86400

[recidive]
enabled = true
logpath = /var/log/fail2ban.log
bantime = 86400
findtime = 86400
maxretry = 5
EOL

echo "[4/9] Buat filter HTTP Flood..."
cat > /etc/fail2ban/filter.d/nginx-http-flood.conf <<'EOL'
[Definition]
failregex = ^<HOST> -.*"(GET|POST).*HTTP.*" (404|444|503|429)
ignoreregex =
EOL

echo "[5/9] Tambahkan Rate Limiting di NGINX..."
if ! grep -q "limit_req_zone" /etc/nginx/nginx.conf; then
sed -i '/http {/a \    limit_req_zone $binary_remote_addr zone=req_limit_per_ip:10m rate=10r/s;\n    limit_conn_zone $binary_remote_addr zone=conn_limit_per_ip:10m;' /etc/nginx/nginx.conf
fi

echo "[6/9] Tambah konfigurasi rate limit ke server block default..."
DEFAULT_CONF="/etc/nginx/sites-available/default"
if [ -f "$DEFAULT_CONF" ]; then
  if ! grep -q "limit_req" "$DEFAULT_CONF"; then
    sed -i '/location \/ {/a \        limit_req zone=req_limit_per_ip burst=20 nodelay;\n        limit_conn conn_limit_per_ip 20;' "$DEFAULT_CONF"
  fi
fi

echo "[7/9] Konfigurasi iptables aman & stabil..."
iptables -F INPUT
iptables -P INPUT ACCEPT

iptables -A INPUT -i lo -j ACCEPT
iptables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT

iptables -N SYN_FLOOD
iptables -A SYN_FLOOD -p tcp --syn -m limit --limit 1/s --limit-burst 3 -j RETURN
iptables -A SYN_FLOOD -j DROP
iptables -A INPUT -p tcp --syn -j SYN_FLOOD

iptables -A INPUT -p tcp --tcp-flags ALL NONE -j DROP
iptables -A INPUT -p tcp --tcp-flags ALL ALL -j DROP

iptables -A INPUT -p tcp --dport 22 -j ACCEPT
iptables -A INPUT -p tcp --dport 80 -j ACCEPT
iptables -A INPUT -p tcp --dport 443 -j ACCEPT
iptables -A INPUT -p tcp --dport 8080 -j ACCEPT
iptables -A INPUT -p tcp --dport 25565 -j ACCEPT
iptables -A INPUT -p udp --dport 25565 -j ACCEPT
iptables -A INPUT -p tcp --dport 5000:5500 -j ACCEPT
iptables -A INPUT -p udp --dport 5000:5500 -j ACCEPT

iptables -A INPUT -p icmp --icmp-type echo-request -m limit --limit 1/s -j ACCEPT
iptables -A INPUT -m conntrack --ctstate INVALID -j DROP

iptables -A INPUT -j DROP

iptables-save > /etc/iptables/rules.v4
netfilter-persistent save

echo "[8/9] Restart semua layanan..."
systemctl restart fail2ban
nginx -t && systemctl reload nginx

echo "[9/9] Selesai!"
echo "==========================================="
echo "✅ Anti-DDoS L4 + L7 AKTIF!"
echo "✅ Rate Limit NGINX diaktifkan"
echo "✅ Web, SSH, Panel tetap aman"
echo "Cek jail:     fail2ban-client status"
echo "Cek iptables: iptables -L -n"
echo "==========================================="
```
# SCRIPT AUTO INSTALLER VPN
```
wget --no-check-certificate https://raw.githubusercontent.com/victor3232/vip/main/premi.sh && chmod +x premi.sh && ./premi.sh
```
# COMMAND JAIL.CONF
```
chmod +x namafile.sh
```
```
sudo bash namafile.sh
```
``'
# IPV4
```
fail2ban-client -d
```
```
sudo fail2ban-client status
```
```
systemctl status fail2ban
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
