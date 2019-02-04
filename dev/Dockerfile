FROM postgres:latest

COPY init.sql /root/

RUN psql rosetta -f /root/init.sql

CMD ["postgres"]