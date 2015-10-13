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
                    type: indicator['type'],
                    unit: indicator['unit'],
                    data: data_url(indicator['id'])
                  }
                end
  }
end

def data_url(id) 
  country = params[:iso]
  region  = params[:id_1]
  thresh  = params[:thresh]

  url =  "/api/indicators/#{ id }"
  url += "/#{ country }"       if country.present?
  url += "/#{ region }"        if region.present?
  url += "?thresh=#{ thresh }" if thresh.present?

  url.to_s
end