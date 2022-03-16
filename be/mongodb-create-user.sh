#!/bin/bash
set -e

echo "MongoDB init script started with MONGO_INITDB_ROOT_USERNAME=$MONGO_INITDB_ROOT_USERNAME and MONGO_INITDB_DATABASE=$MONGO_INITDB_DATABASE"
mongo -u $MONGO_INITDB_ROOT_USERNAME -p $MONGO_INITDB_ROOT_PASSWORD <<EOF
use $MONGO_INITDB_DATABASE;
db.createUser({
      user: '$MONGO_DB_USERNAME',
      pwd: '$MONGO_DB_PASSWORD',
      roles: [{
        role: 'readWrite',
        db: '$MONGO_INITDB_DATABASE'
      }]
    });
EOF
echo "Executing init script finished"
