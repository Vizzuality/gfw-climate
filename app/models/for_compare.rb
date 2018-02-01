require 'httparty'

class ForCompare
  include HTTParty
  default_timeout 10

  class << self

    def base_path
      "#{ENV['CDB_API_HOST']}?q="
    end

    def find_countries_or_jurisdictions(filter_params)
      params_array = filter_params[:path].to_s.downcase.split('/').map { |p| p.split('+') }
      params_array = params_array.map { |p| (p - ["0"] unless ( p[2].present? && p[2] != "0" ) ) || p }

      values = []
      (params_array.count).times do |i|
        url =  base_path
        # ToDo: Implementation for Protected areas
        url += if params_array[i][1].blank? || (params_array[i][1].present? && params_array[i][1] == '0')
                 search_country_query(params_array[i][0].upcase)
               else
                 search_jurisdiction_query(params_array[i][0].upcase, params_array[i][1])
               end

        i_cached_url = timeouts do
                         item_caching(params_array[i], nil, nil, nil) do
                           get(url)['rows'][0]
                         end
                       end
        values << i_cached_url
      end

      timeouts do
        item_caching(params_array, nil, nil, nil) do
          values
        end
      end
    end

    def search_country_query(iso)
      filter =  "iso = '#{iso}'"
      "SELECT iso, name_engli AS name, cartodb_id
       FROM #{CDB_COUNTRIES_TABLE}
       WHERE #{filter}"
    end

    def search_jurisdiction_query(iso, id)
      filter =  "iso = '#{iso}'"
      filter += "AND id_1 = #{id}"
      "SELECT cartodb_id, iso, id_1 as id, name_1 as name
       FROM #{CDB_SUBNAT_TABLE}
       WHERE #{filter}"
    end

    include Concerns::Cached

  end

end
