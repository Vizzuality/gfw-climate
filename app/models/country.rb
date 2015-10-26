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

    def find_country(filter_params)
      country_id   = filter_params[:id].downcase
      thresh_value = filter_params[:thresh].present? ? filter_params['thresh'] : '25'

      # Allowed values for thresh: 10, 15, 20, 25, 30, 50, 75
      url =  "#{ base_path }/#{ country_id }"
      url += "?thresh=#{ thresh_value }"

      timeouts do
        item_caching(country_id, nil, nil, thresh_value) do
          get(url)
        end
      end
    end

    include Concerns::Cached

  end

end