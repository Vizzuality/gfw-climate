require 'httparty'

class Country
  include HTTParty
  default_timeout 10

  class << self
    def base_countries_path
      "#{ENV['CDB_API_HOST']}?q="
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
          country = country_data(iso) || {}
          country.merge({"subnat_bounds" => jurisdictions_for(iso)}).
            merge({"areas_of_interest" => areas_of_interest_for(iso)})
        end
      end
    end

    def index_query
      <<-SQL
       SELECT DISTINCT ga28.iso, name_engli AS name, centroid AS latlng
       FROM #{CDB_COUNTRIES_TABLE} ga28
       INNER JOIN gfw_climate_config cc ON cc.iso = ga28.iso
       ORDER BY name
      SQL
    end

    def country_data iso
     sql = <<-SQL
      SELECT iso, name_engli AS name, centroid AS latlng
      FROM #{CDB_COUNTRIES_TABLE}
      WHERE UPPER(iso) = UPPER('#{iso}')
     SQL

     get(base_countries_path+sql)['rows'].first
    end

    def jurisdictions_for iso
      sql = <<-SQL
        SELECT name_1 AS jurisdiction_name, iso, id_1,
          cartodb_id, ST_AsGeoJSON(ST_Envelope(the_geom))::json AS bounds
        FROM #{Jurisdiction::CDB_JURISDICTIONS_TABLE}
        WHERE UPPER(iso) = UPPER('#{iso}')
        ORDER by jurisdiction_name
      SQL

      get(base_countries_path+sql)['rows']
    end

    def areas_of_interest_for iso
      sql = <<-SQL
        SELECT DISTINCT b.boundary_code AS id, boundary_name AS name,
        b.boundary_code AS code
        FROM #{CDB_INDICATORS_VALUES_TABLE} i
        INNER JOIN #{CDB_BOUNDARIES_TABLE} b ON
        i.boundary_code = b.boundary_code
        WHERE UPPER(iso_and_sub_nat) = UPPER('#{iso}') AND
        b.boundary_code <> 'admin'
        ORDER BY b.boundary_code
      SQL

      get(base_countries_path+sql)['rows']
    end

    include Concerns::Cached

  end

end
