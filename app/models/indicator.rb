require 'httparty'

class Indicator
  include HTTParty
  default_timeout 10

  class << self

    ADMIN_BOUNDARY_ID = 1
    INDICATORS_VALUES_TABLE = "indicators_values"
    INDICATORS_TABLE = "indicators"

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
      thresh_value = filter_params[:thresh].present? ? filter_params['thresh'].to_i : 25

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

    private

    def index_query
      <<-SQL
       SELECT indicator_group, chart_type, description, indicator_id, value_units
       FROM #{INDICATORS_TABLE}
       GROUP BY indicator_id, indicator_group, description, value_units, chart_type
      SQL
    end

    def show_query(indicator_id, iso, id_1, area, thresh_value)
      filter = <<-SQL
        indicator_id = #{indicator_id}
        AND (value IS NOT NULL OR text_value IS NOT NULL)
        AND threshold = #{thresh_value}
      SQL
      filter += filter_location(iso, id_1, area) if iso.present?

      sql = <<-SQL
        SELECT *
        FROM #{INDICATORS_VALUES_TABLE} AS values
        WHERE #{filter}
      SQL

      sql.squish
    end

    def filter_location(iso, id_1, area)
      <<-SQL
        AND iso = UPPER('#{iso}')
        AND sub_nat_id #{id_1.blank? ? 'IS NULL' : "= #{id_1}" }
        AND boundary_id = #{area.blank? ? ADMIN_BOUNDARY_ID : area}
      SQL
    end

    include Concerns::Cached

  end

end
