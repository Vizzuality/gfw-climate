object false

node :widget do
  {
    id:   @widget.id,
    name: @widget.name,
    type: @widget.type,
    indicators: @widget.indicators.map do |indicator|
                  {  
                    id:   indicator['id'],
                    name: indicator['name'],
                    data: data_url(indicator['id'], indicator['data_source'])
                  }
                end
  }
end

def data_url(id, source) 
  country = params[:iso]
  region  = params[:id_1]
  thresh  = params[:thresh]

  url = case source
        when 'UMD'
          path =  "/api/countries/#{ country }" if country.present?
          path += "/#{ region }"                if region.present?
          path += "?thresh=#{ thresh }"         if thresh.present?
          path
        else
          path =  "/api/indicators/#{ id }"
          path += "/#{ country }"       if country.present?
          path += "/#{ region }"        if region.present?
          path += "?thresh=#{ thresh }" if thresh.present?
          path
        end

  url.to_s
end