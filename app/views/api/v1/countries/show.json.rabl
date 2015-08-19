object false

node :country do
  {
    iso:         @country['iso'],
    name:        @country['name'],
    enabled:     @country['enabled'],
    coordinates: @country['bounds']['coordinates'][0],
    type:        @country['bounds']['type'],
    emissions:   @country['emissions']
  }
end