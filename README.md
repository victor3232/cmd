# CRON JOB

```
0 0 * * * /sbin/shutdown -r now
```
```
1 12 * * * php /var/www/pterodactyl/artisan cache:clear >> /dev/null 2>&1
```
