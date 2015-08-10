# README

[![Build Status](https://travis-ci.org/Vizzuality/gfw-climate.svg?branch=master)](https://travis-ci.org/Vizzuality/gfw-climate) [![Code Climate](https://codeclimate.com/github/Vizzuality/gfw-climate/badges/gpa.svg)](https://codeclimate.com/github/Vizzuality/gfw-climate) [![Coverage Status](https://coveralls.io/repos/Vizzuality/gfw-climate/badge.svg?branch=master&service=github)](https://coveralls.io/github/Vizzuality/gfw-climate?branch=master)

## Requirements

  - **Ruby version:** mri 2.2.2
  - **NodeJs version:** 0.10+
  - **Redis** Homebrew: brew install redis

## SETUP

Just execute the script file in bin/setup

  - Depends on gfwc [repository](https://github.com/Vizzuality/gfw-climate)

  - Create .env file with:

```
GFW_API_HOST=http://gfw-apis.appspot.com
BLOG_HOST=http://blog.globalforestwatch.org
TERMS_COOKIE=cookie_terms
```

### REDIS

  - OS X
```
brew install redis
brew info redis
launchctl unload ~/Library/LaunchAgents/homebrew.mxcl.redis.plist
launchctl load ~/Library/LaunchAgents/homebrew.mxcl.redis.plist
```

  - Add to .env:

```
REDISCLOUD_URL=redis://localhost:6379
```

  - Useful commands

```
redis-cli monitor
redis-cli flushall
```

### Install global dependencies:

    npm install -g bower

### Install gems:

    bundle install

### Install assets and front end dependencies:
    
    bower install

### Run application:

    foreman start

## TEST

  - Run rspec: bin/rspec

  - Run teaspoon: rake teaspoon

  - Run all: rake

## DEPLOYMENT

### Heroku

**Automatic deploys from  staging are enabled**

Every push to staging will deploy a new version of this app. Deploys happen automatically: be sure that this branch in GitHub is always in a deployable state and any tests have passed before you push.

Heroku wait for CI to pass before deploy.