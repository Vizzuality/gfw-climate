object false

node :country do
  {
    iso:           @country['iso'],
    thresh:        @country['params']['thresh'],
    enabled:       @country['enabled'],
    name:          @country['name'],
    conventions:   {
                     cdb:            @country['convention_cbd'],
                     cites:          @country['convention_cites'],
                     ilo:            @country['convention_ilo'],
                     itta:           @country['convention_itta'],
                     kyoto:          @country['convention_kyoto'],
                     nlbi:           @country['convention_nlbi'],
                     ramsar:         @country['convention_ramsar'],
                     unccd:          @country['convention_unccd'],
                     unfccc:         @country['convention_unfccc'],
                     world_heritage: @country['convention_world_heritage']
                   },
    emissions:     @country['emissions'],
    carbon_stocks: @country['carbon_stocks'],
    gva:           @country['gva'],
    gva_percent:   @country['gva_percent'],
    bounds:        {
                     coordinates: @country['bounds']['coordinates'][0],
                     type:        @country['bounds']['type']
                   },
    tenure:        @country['tenure'][0],
    forests:       @country['forests'],
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
                   end
  }
end