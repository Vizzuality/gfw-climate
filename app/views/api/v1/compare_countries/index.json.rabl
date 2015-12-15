collection @objects, root: 'countries', object_root: false

node do |object|
  {
    iso:           object['iso'],
    name:          object['name'],
    id_1:          object['id'],
    cartodb_id:    object['cartodb_id'],
    widgets:       @widgets.map do |widget| 
                     {
                       id:   widget.id,
                       data: data_url(widget.id, object['iso'], object['id'])
                     }
                   end
  }
end

def data_url(id, iso, id_1) 
  country = iso
  region  = id_1
  thresh  = params[:thresh]

  url =  "/api/widgets/#{ id }"
  url += "/#{ country }"       if country.present?
  url += "/#{ region }"        if region.present?
  url += "?thresh=#{ thresh }" if thresh.present?

  url.to_s
end
