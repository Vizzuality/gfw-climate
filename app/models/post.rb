require 'httparty'

class Post
  include HTTParty
  default_timeout 5

  class << self

    def base_path
      "#{ENV['BLOG_HOST']}/feed"
    end

    def timeouts
      begin
        yield
      rescue Net::OpenTimeout, Net::ReadTimeout
        {}
      end
    end

    def cache_key_posts(options)
      "posts_all_#{options}"
    end

    def cache_key_post(options)
      "posts_post_#{options}"
    end

    def posts_caching(options)
      if cached = $redis.get(cache_key_posts(options))
        JSON.parse(cached)
      else
        yield.tap do |posts|
          $redis.set(cache_key_posts(options), posts.to_json)
        end
      end
    end

    def post_caching(options)
      if cached = $redis.get(cache_key_posts(options))
        JSON.parse(cached)
      else
        yield.tap do |post|
          $redis.set(cache_key_posts(options), post.to_json)
        end
      end
    end

    def find_all(options)
      page = options[:page] ||= '1'
      url  = "#{base_path}/?paged=#{page}"
      timeouts do
        posts_caching(page) do
          get(url)['rss']['channel']['item']
        end
      end
    end

    def find_post(link)
      url = "#{base_path}/#{link}"
      timeouts do
        posts_caching(link) do
          get(url)
        end
      end
    end

  end
end