require 'httparty'

class Jurisdiction
  include HTTParty
  default_timeout 10

  CDB_JURISDICTIONS_TABLE = "gadm27_adm1"
  class << self

    def base_path
      "#{ENV['CDB_API_HOST']}?q="
    end

    def find_jurisdiction(filter_params)
      iso      = filter_params[:id].downcase
      id_1 = filter_params[:id_1].to_i

      sql = <<-SQL
        SELECT name_1 AS jurisdiction_name, iso, id_1,
          cartodb_id, iso, name_0 AS country_name,
          ST_AsGeoJSON(ST_Envelope(the_geom))::json AS bounds
        FROM #{CDB_JURISDICTIONS_TABLE}
        WHERE UPPER(iso) = UPPER('#{iso}') AND id_1 = #{id_1}
        ORDER BY jurisdiction_name
      SQL
      url = base_path+sql

      timeouts do
        item_caching(iso, id_1) do
          get(url)['rows'].first
        end
      end
    end

    include Concerns::Cached

  end

end
