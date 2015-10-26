object false

node :jurisdiction do
  {
    iso:          @country['iso'],
    thresh:       @country['params']['thresh'],
    country_name: @country['name'],
    name:         @jurisdiction['name_1'],
    id:           @jurisdiction['id_1'],
    cartodb_id:   @jurisdiction['cartodb_id'],
    bounds:       {
                    coordinates: @jurisdiction['bounds']['coordinates'][0],
                    type:        @jurisdiction['bounds']['type']
                  }
  }
end