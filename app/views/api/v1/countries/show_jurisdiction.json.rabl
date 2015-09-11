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
                  },
    umd:          @umd.map do |umd| 
                    {
                      year:        umd['year'],
                      extent:      umd['extent'],
                      extent_perc: umd['extent_perc'],
                      gain:        umd['gain'],
                      gain_perc:   umd['gain_perc'],
                      loss:        umd['loss'],
                      loss_perc:   umd['loss_perc'],
                      total_gain:  umd['total_gain'],
                      thresh:      umd['thresh']
                    }
                  end
  }
end