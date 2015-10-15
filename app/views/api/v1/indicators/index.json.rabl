collection @indicators, root: 'indicators', object_root: false

node do |indicator|
  {
    indicator_id:    indicator['indicator_id'],
    indicator_group: indicator['indicator_group'],
    description:     indicator['description'],
    unit:            indicator['value_units'],
    type:            indicator['chart_type']
  }
end