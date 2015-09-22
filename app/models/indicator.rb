require 'httparty'

class Indicator
  include HTTParty
  default_timeout 5

  class << self

    def base_path
      "#{ENV['CDB_API_HOST']}?q="
    end

    def find_all
      url =  base_path
      url += index_query
      timeouts do
        items_caching do
          get(url)['rows'].sort_by { |i| i['indicator_id'] }
        end
      end
    end

    def find_indicator(filter_params)
      indicator_id = filter_params[:id]
      thresh_value = filter_params[:thresh].present? ? filter_params['thresh'] : '10'
      iso          = filter_params[:iso].downcase if filter_params[:iso].present?

      # Allowed values for thresh: 10, 15, 20, 25, 30, 50, 75
      url =  base_path
      url += show_query(indicator_id, iso, thresh_value)

      timeouts do
        item_caching(indicator_id, iso, nil, thresh_value) do
          get(url)['rows'].sort_by { |i| i['year'] }
        end
      end
    end

    def index_query
      'SELECT indicator_group, description, indicator_id, value_units
       FROM indicators
       GROUP BY indicator_id, indicator_group, description, value_units'
    end

    def show_query(indicator_id, iso, thresh_value)
      filter =  "indicator_id = '#{indicator_id}'"
      filter += "AND iso = UPPER('#{iso}')" if iso.present?
      filter += "AND threshold_greater_than = '#{thresh_value}'"
      "SELECT *
       FROM indicators_values
       WHERE #{filter}
       GROUP BY year, cartodb_id, value"
    end

    include Concerns::Cached

  end

end