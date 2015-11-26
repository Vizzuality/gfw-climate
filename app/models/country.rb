require 'httparty'

class Country
  include HTTParty
  default_timeout 10

  class << self
    CDB_INDICATORS_TABLE="indicators_values"
    CDB_COUNTRIES_TABLE = "gadm27_adm0"
    CDB_JURISDICTIONS_TABLE = "gadm27_adm1"
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
      iso   = filter_params[:id].downcase

      timeouts do
        item_caching(iso, nil, nil, nil) do
          country_data(iso).
            merge({"subnat_bounds" => jurisdictions_for(iso)}).
            merge({"areas_of_interest" => areas_of_interest_for(iso)})
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

    def country_data iso
     sql = <<-SQL
      SELECT climate_iso AS iso, true as enabled, name_0 AS name
      FROM #{CDB_COUNTRIES_TABLE}
      WHERE UPPER(climate_iso) = UPPER('#{iso}')
     SQL

       get(base_countries_path+sql)['rows'].first
    end

    def jurisdictions_for iso
      sql = <<-SQL
        SELECT name_1, iso, id_1, cartodb_id,
          ST_AsGeoJSON(ST_Envelope(the_geom))::json AS bounds
        FROM #{CDB_JURISDICTIONS_TABLE}
        WHERE UPPER(iso) = UPPER('#{iso}')
      SQL

      get(base_countries_path+sql)['rows']
    end

    def areas_of_interest_for iso
      sql = <<-SQL
        SELECT DISTINCT boundary_id AS id, boundary_name AS name, boundary_code AS code
        FROM #{CDB_INDICATORS_TABLE} i
        INNER JOIN #{CDB_BOUNDARIES_TABLE} b ON
        i.boundary_id = b.cartodb_id
        WHERE UPPER(iso) = UPPER('#{iso}') AND
        boundary <> 'admin'
        ORDER BY boundary_id
      SQL

      get(base_countries_path+sql)['rows']
    end

    include Concerns::Cached

  end

end
