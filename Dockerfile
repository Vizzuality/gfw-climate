#FROM damireh/ruby-2.3.1-node-6.9.4
FROM ruby:2.2.2

# Install node & yarn
RUN curl -sL https://deb.nodesource.com/setup_7.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/cache/apt \
    && npm install -g yarn

MAINTAINER Sebastian Schkudlara "sebastian.schkudlara@vizzuality.com"

ENV BUILD_PACKAGES bash curl build-essential libxml2 imagemagick libmagickcore-dev libmagickwand-dev

# Update and install all of the required packages.
# At the end, remove the apk cache
RUN apt-get update && \
    apt-get install -y $BUILD_PACKAGES && \
    rm -rf /var/cache/apk/*

RUN gem install bundler --no-ri --no-rdoc

# Use libxml2, libxslt a packages from alpine for building nokogiri
RUN bundle config build.nokogiri

RUN mkdir /gfw-climate

ADD bower.json /gfw-climate/bower.json
RUN npm install -g grunt-cli bower

COPY Gemfile Gemfile
COPY Gemfile.lock Gemfile.lock
RUN bundle install --jobs 20 --retry 5

ADD . /gfw-climate

WORKDIR /gfw-climate
EXPOSE 5000

ENTRYPOINT ["./entrypoint.sh"]
