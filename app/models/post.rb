require 'httparty'

class Post
  include HTTParty
  default_timeout 5

  class << self

    def base_path
      "#{ENV['BLOG_HOST']}/feed"
    end

    def find_all(options)
      page = options[:page] ||= '1'
      url  = "#{base_path}/?paged=#{page}"
      timeouts do
        items_caching(page) do
          get(url)['rss']['channel']['item']
        end
      end
    end
    
    def find_post(link)
      url = "#{base_path}/#{link}"
      timeouts do
        item_caching(link, 'html') do
          get(url)
        end
      end
    end

    include Concerns::Cached

  end
end