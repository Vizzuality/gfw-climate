#!/bin/bash
set -e

case "$1" in
    develop)
        echo "Running Development Server"

        export SECRET_KEY_BASE=$(rake secret)
        npm install -g bower
        bower install --allow-root
        exec foreman start
        ;;
    test)
        echo "Running automated tests"
        bundle exec rake db:exists RAILS_ENV=test
        export SECRET_KEY_BASE=$(rake secret)
        exec rspec
        ;;
    start)
        echo "Running Start"
        bundle exec rake db:exists RAILS_ENV=production

        export SECRET_KEY_BASE=$(rake secret)

        exec ./server start production
        ;;
    *)
        exec "$@"
esac
