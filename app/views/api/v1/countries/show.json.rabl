object false

node :country do
  {
    iso:           @country['iso'],
    enabled:       @country['enabled'],
    name:          @country['name'],
    jurisdictions: @country['subnat_bounds'].map do |territory|
                     {
                       name:       territory['name_1'],
                       iso:        territory['iso'],
                       id:         territory['id_1'],
                       cartodb_id: territory['cartodb_id'],
                       bounds:     {
                                     coordinates: territory['bounds']['coordinates'][0],
                                     type:        territory['bounds']['type']
                                   }
                     }
                   end,
    areas_of_interest: @country['areas_of_interest'].map do |aoi|
                    {
                      id: aoi['id'],
                      name: aoi['name'],
                      code: aoi['code']
                    }
                   end
  }
end
