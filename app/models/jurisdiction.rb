require 'httparty'

class Jurisdiction
  include HTTParty
  default_timeout 5

  class << self

    def base_path
      "#{ENV['GFW_API_HOST']}"
    end

    def find_jurisdiction(filter_params)
      country_id      = filter_params[:id].downcase
      jurisdiction_id = filter_params[:id_1].to_i

      url = "#{ base_path }/countries/#{ country_id }"

      timeouts do
        item_caching(country_id, jurisdiction_id) do
          get(url)['subnat_bounds'].detect{ |jurisdiction| jurisdiction['id_1'] == jurisdiction_id }
        end
      end
    end

    def find_umd(filter_params)
      country_id      = filter_params[:id].downcase
      jurisdiction_id = filter_params[:id_1].to_i
      thresh_value    = filter_params[:thresh].present? ? filter_params['thresh'] : '25'
      umd             = 'UMD'

      #forest-change/umd-loss-gain/admin/AUS/2
      # Allowed values for thresh: 10, 15, 20, 25, 30, 50, 75
      url =  "#{ base_path }/forest-change/umd-loss-gain/admin/#{ country_id }/#{ jurisdiction_id }"
      url += "?thresh=#{ thresh_value }"
      
      timeouts do
        item_caching(country_id, jurisdiction_id, nil, thresh_value, umd) do
          get(url)['years']
        end
      end
    end

    include Concerns::Cached

  end

end