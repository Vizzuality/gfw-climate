collection @objects, root: 'countries', object_root: false

node do |object|
  {
    iso:           object['iso'],
    name:          object['name'],
    id:            object['id'],
    cartodb_id:    object['cartodb_id'],
    conventions:   {
                     cdb:            object['convention_cbd'],
                     cites:          object['convention_cites'],
                     ilo:            object['convention_ilo'],
                     itta:           object['convention_itta'],
                     kyoto:          object['convention_kyoto'],
                     nlbi:           object['convention_nlbi'],
                     ramsar:         object['convention_ramsar'],
                     unccd:          object['convention_unccd'],
                     unfccc:         object['convention_unfccc'],
                     world_heritage: object['convention_world_heritage']
                   },
    emissions:     object['emissions'],
    carbon_stocks: object['carbon_stocks'],
    gva:           object['gva'],
    gva_percent:   object['gva_percent']
  }
end