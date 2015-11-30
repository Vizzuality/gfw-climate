object false

node :jurisdiction do
  {
    iso:          @jurisdiction['iso'],
    country_name: @jurisdiction['country_name'],
    name:         @jurisdiction['jurisdiction_name'],
    id:           @jurisdiction['id_1'],
    cartodb_id:   @jurisdiction['cartodb_id'],
    bounds:       {
                    coordinates: @jurisdiction['bounds']['coordinates'][0],
                    type:        @jurisdiction['bounds']['type']
                  }
  }
end
