require 'httparty'

class Jurisdiction
  include HTTParty
  default_timeout 10

  class << self

    def base_path
      "#{ENV['GFW_API_HOST']}/countries"
    end

    def find_jurisdiction(filter_params)
      country_id      = filter_params[:id].downcase
      jurisdiction_id = filter_params[:id_1].to_i

      url = "#{ base_path }/#{ country_id }"

      timeouts do
        item_caching(country_id, jurisdiction_id) do
          get(url)['subnat_bounds'].detect{ |jurisdiction| jurisdiction['id_1'] == jurisdiction_id }
        end
      end
    end

    include Concerns::Cached

  end

end