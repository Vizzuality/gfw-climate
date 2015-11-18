require 'httparty'

class Indicator
  include HTTParty
  default_timeout 10

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
      iso          = filter_params[:iso].downcase if filter_params[:iso].present?
      id_1         = filter_params[:id_1] if filter_params[:id_1].present? && filter_params[:id_1].to_i > 0
      area         = filter_params[:area] if filter_params[:area].present?
      thresh_value = filter_params[:thresh].present? ? filter_params['thresh'] : '25'

      # Allowed values for thresh: 10, 15, 20, 25, 30, 50, 75
      url =  base_path
      url += show_query(indicator_id, iso, id_1, area, thresh_value)
      ids = "#{iso}_#{id_1}_#{area}"

      timeouts do
        item_caching(indicator_id, ids, nil, thresh_value) do
          get(url)['rows'].blank? ? {} : get(url)['rows'].sort_by { |i| i['year'] }
        end
      end
    end

    def index_query
      'SELECT indicator_group, chart_type, description, indicator_id, value_units
       FROM indicators
       GROUP BY indicator_id, indicator_group, description, value_units, chart_type'
    end

    def show_query(indicator_id, iso, id_1, area, thresh_value)
      filter =  "indicator_id = '#{indicator_id}'"
      filter += "AND iso = UPPER('#{iso}')
                 AND sub_nat_id IS NULL
                 AND boundary = 'admin'"    if iso.present? && id_1.blank? && area.blank?
      filter += "AND iso = UPPER('#{iso}')
                 AND sub_nat_id IS NULL
                 AND boundary_id = #{area}" if iso.present? && area.present?
      filter += "AND iso = UPPER('#{iso}')
                 AND sub_nat_id = '#{id_1}'
                 AND boundary = 'admin'"    if iso.present? && id_1.present?

      filter += "AND threshold = '#{thresh_value}'"
      "SELECT *
       FROM indicators_values AS values
       WHERE #{filter}"
    end

    include Concerns::Cached

  end

end
