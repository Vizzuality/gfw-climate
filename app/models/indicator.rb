require 'httparty'

class Indicator
  include HTTParty
  default_timeout 5

  class << self

    def base_path
      "#{ENV['GFW_API_HOST']}/indicators"
    end

    def find_all
      url = base_path
      timeouts do
        items_caching do
          get(url)['indicators']
        end
      end
    end

    def find_indicator(filter_params)
      indicator_id = filter_params[:id]
      thresh_value = filter_params[:thresh] if filter_params[:thresh].present?

      params = if thresh_value.present?
                 "?thresh=#{ thresh_value }"
               end

      # Allowed values for thresh: 10, 15, 20, 25, 30, 50, 75
      url = "#{ base_path }/#{ indicator_id }#{params}"

      timeouts do
        item_caching(indicator_id, nil, nil, thresh_value) do
          get(url)
        end
      end
    end

    include Concerns::Cached

  end

end