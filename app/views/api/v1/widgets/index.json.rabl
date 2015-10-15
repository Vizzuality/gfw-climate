collection @widgets, root: 'widgets'

attributes :id, :name

node(:data) { |widget| data_url(widget.id) }

def data_url(id) 
  country = params[:iso]
  region  = params[:id_1]
  thresh  = params[:thresh]

  url =  "/api/widgets/#{ id }"
  url += "/#{ country }"       if country.present?
  url += "/#{ region }"        if region.present?
  url += "?thresh=#{ thresh }" if thresh.present?

  url.to_s
end