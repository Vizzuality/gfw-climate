require 'httparty'

class Country
  include HTTParty
  default_timeout 10

  class << self
    CDB_INDICATORS_TABLE="indicators_values"
    CDB_COUNTRIES_TABLE = "gadm27_adm0"
    CDB_BOUNDARIES_TABLE="boundaries_table"

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
          get(url)['rows']
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
         get(url).merge({"areas_of_interest" => areas_of_interest_for(country_id)})
        end
      end
    end

    def index_query
      <<-SQL
       SELECT DISTINCT climate_iso AS iso, name_0 AS name, true as enabled
       FROM #{CDB_COUNTRIES_TABLE}
       WHERE climate_iso IS NOT NULL
       ORDER BY name
      SQL
    end

    def areas_of_interest_for country_iso
      sql = <<-SQL
        SELECT DISTINCT boundary_id AS id, boundary_name AS name, boundary_code AS code
        FROM #{CDB_INDICATORS_TABLE} i
        INNER JOIN #{CDB_BOUNDARIES_TABLE} b ON
        i.boundary_id = b.cartodb_id
        WHERE UPPER(iso) = UPPER('#{country_iso}') AND
        boundary <> 'admin'
        ORDER BY boundary_id
      SQL

      url =  base_countries_path
      url += sql

      get(url)['rows']
    end

    include Concerns::Cached

  end

end
