collection @countries, root: 'countries', object_root: false

node do |country|
  {
    iso:     country['iso'],
    name:    country['name'],
  }
end
