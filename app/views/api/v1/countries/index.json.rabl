collection @countries, root: 'countries', object_root: false

node do |country|
  {
    iso:     country['iso'],
    name:    country['name'],
    enabled: country['enabled']
  } if country['enabled'].present?
end