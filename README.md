# GFW-CLIMATE #

[![Build Status](https://travis-ci.org/Vizzuality/gfw-climate.svg?branch=develop)](https://travis-ci.org/Vizzuality/gfw-climate) [![Code Climate](https://codeclimate.com/github/Vizzuality/gfw-climate/badges/gpa.svg)](https://codeclimate.com/github/Vizzuality/gfw-climate) [![Coverage Status](https://coveralls.io/repos/Vizzuality/gfw-climate/badge.svg?branch=develop&service=github)](https://coveralls.io/github/Vizzuality/gfw-climate?branch=develop)

## Requirements ##

  **Ruby version:** mri 2.2.2

  **NodeJs version:** 0.10+

  **Redis** Homebrew: brew install redis

## SETUP ##

Just execute the script file in bin/setup

  Depends on gfwc [repository](https://github.com/Vizzuality/gfw-climate)

  Create .env file with:

```
RACK_ENV=development
GFW_API_HOST=http://gfw-apis.appspot.com
BLOG_HOST=http://blog.globalforestwatch.org
TERMS_COOKIE=cookie_terms
REDISCLOUD_URL=redis://localhost:6379/0
CODECLIMATE_REPO_TOKEN=c5c128fcb301371d4b89bec2df714028e0a75deb8d732f49f922626aa84c3524
LAYER_SPEC=layerspec_nuclear_hazard
FEEDBACK_MAIL=example@gfw-climate.com
```

### REDIS ###

OS X
```
brew install redis
brew info redis
launchctl unload ~/Library/LaunchAgents/homebrew.mxcl.redis.plist
launchctl load ~/Library/LaunchAgents/homebrew.mxcl.redis.plist
```
Add to .env:

```
REDISCLOUD_URL=redis://localhost:6379
```
Useful commands

```
redis-cli monitor
redis-cli flushall
```

### Install global dependencies: ###

    npm install -g bower

### Install gems: ###

    bundle install

### Install assets and front end dependencies: ###
    
    bower install

### Run application: ###

    foreman start

## TEST ##

  Run rspec: 
  ```ruby
    bin/rspec
  ```
  Run teaspoon: 
  ```ruby  
    rake teaspoon
  ```
  Run all: 
  ```ruby
    rake
  ```

## API ##

### SAMPLE ###
  
  Getting a list of enabled countries
  
    curl "http://localhost:5000/api/countries" -X GET \
    -H "Accept: application/json; application/gfwc-v1+json" \
    -H "Content-Type: application/json"

  Getting a specific country
  
    curl "http://localhost:5000/api/countries/aus" -X GET \
    -H "Accept: application/json; application/gfwc-v1+json" \
    -H "Content-Type: application/json"

### API DOCUMENTATION ###
   
   For API documentation visit /api/docs

   Generate the docs!

```ruby
rake docs:generate
```

## DEPLOYMENT ##

### Heroku ###

**Automatic deploys from  staging are enabled**

Every push to staging will deploy a new version of this app. Deploys happen automatically: be sure that this branch in GitHub is always in a deployable state and any tests have passed before you push.

Heroku wait for CI to pass before deploy.
