require 'httparty'

class Country
  include HTTParty
  default_timeout 5

  class << self

    def base_path
      "#{ENV['GFW_API_HOST']}/countries"
    end

    def find_all
      url = base_path
      timeouts do
        items_caching do
          get(url)['countries']
        end
      end
    end

    def find_country(country_id)
      url = "#{ base_path }/#{ country_id }"
      timeouts do
        item_caching(country_id) do
          get(url)
        end
      end
    end

    include Concerns::Cached

  end
end