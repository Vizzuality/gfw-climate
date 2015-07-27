require 'httparty'

class Country
  include HTTParty
  default_timeout 10

  class << self

    def base_path
      "#{ENV['GFW_API_HOST']}/countries"
    end

    def timeouts
      begin
        yield
      rescue Net::OpenTimeout, Net::ReadTimeout
        {}
      end
    end

    def cache_key_countries
      "countries_all"
    end

    def cache_key_country(country_id)
      "countries_country_#{ country_id }"
    end

    def countries_caching
      if cached = $redis.get(cache_key_countries)
        JSON[cached]
      else
        $redis.set(cache_key_countries)
      end
    end

    def country_caching(country_id)
      if cached = $redis.get(cache_key_country(country_id))
        JSON[cached]
      else
        yield.tap do |country|
          $redis.set(cache_key_country(country_id), country.to_json)
        end
      end
    end

    def find_all
      url = "#{ base_path }"
      timeouts do
        countries_caching do
          get(url)['countries']
        end rescue get(url)['countries']
      end
    end

    def find_country(country_id)
      url = "#{ base_path }/#{ country_id }"
      timeouts do
        country_caching(country_id) do
          get(url)
        end rescue get(url)
      end
    end

  end

end