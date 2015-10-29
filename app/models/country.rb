require 'httparty'

class Country
  include HTTParty
  default_timeout 10

  class << self

    def base_countries_path
      "#{ENV['CDB_API_HOST']}?q="
    end

    def base_country_path
      "#{ENV['GFW_API_HOST']}/countries"
    end

    def find_all
      url =  base_countries_path
      url += index_query
      timeouts do
        items_caching do
          get(url)['rows'].sort_by { |i| i['name'] }
        end
      end
    end

    def find_country(filter_params)
      country_id   = filter_params[:id].downcase
      thresh_value = filter_params[:thresh].present? ? filter_params['thresh'] : '25'

      # Allowed values for thresh: 10, 15, 20, 25, 30, 50, 75
      url =  "#{ base_country_path }/#{ country_id }"
      url += "?thresh=#{ thresh_value }"

      timeouts do
        item_caching(country_id, nil, nil, thresh_value) do
          get(url)
        end
      end
    end

    def index_query
      'SELECT DISTINCT iso, admin0_name AS name, true as enabled
       FROM indicators_values
       WHERE iso IS NOT NULL AND admin0_name IS NOT NULL
       ORDER BY name'
    end

    include Concerns::Cached

  end

end
