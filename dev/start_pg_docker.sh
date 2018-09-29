#!/usr/bin/env bash

docker run -d -p 5432:5432 --rm --name=rosettadb \
--env-file docker.env \
-v dbdata:/var/lib/postgres/data \
-v $(pwd):/root \
postgres
