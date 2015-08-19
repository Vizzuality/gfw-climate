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
    
    def find_post(filter_params)
      link         = filter_params[:link]
      thresh_value = nil
      format       = 'html'

      url = "#{base_path}/#{link}"
      timeouts do
        item_caching(link, format, thresh_value) do
          get(url)
        end
      end
    end

    include Concerns::Cached

  end
end