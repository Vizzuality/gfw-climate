collection @indicator, root: 'values', object_root: false

node do |value|
  {
    indicator_id:         value['indicator_id'],
    cartodb_id:           value['cartodb_id'],
    iso:                  value['iso'],
    id_1:                 value['sub_nat_id'],
    iso_and_sub_nat:      value['iso_and_sub_nat'],
    boundary:             value['boundary'],
    boundary_id:          value['boundary_id'],
    thresh:               value['thresh'],
    the_geom:             value['the_geom'],
    the_geom_webmercator: value['the_geom_webmercator'],
    country_name:         value['admin0_name'],
    year:                 value['year'],
    value:                value['value'],
    text_value:           value['text_value'],
    sub_nat_name:         value['sub_nat_name'],
    boundary_name:        value['boundary_name']
  }
end
