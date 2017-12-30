#!/bin/sh

cd /root/smart4_portal && /root/smart4_portal/bin/python manage.py collectstatic --noinput
cd /root/smart4_portal && /root/smart4_portal/bin/python manage.py runserver_plus 0.0.0.0:80
