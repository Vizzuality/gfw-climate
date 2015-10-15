object false

node :widget do
  {
    id:         @widget.id,
    name:       @widget.name,
    tabs:       tabs,
    indicators: indicators
  }
end

def tabs
  @widget.tabs.map do |tab|
    {
      position:  tab['position'],
      name:      tab['name'],
      type:      tab['type'],
      default:   tab['default']
    }
  end rescue nil
end

def indicators
  @widget.indicators.map do |indicator|
    {
      id:        indicator['id'],
      name:      indicator['name'],
      type:      indicator['type'],
      unit:      indicator['unit'],
      tab:       indicator['tab'],
      section:   indicator['section'],
      direction: indicator['direction'],
      data:      data_url(indicator['id']),
      default:   indicator['default'],
    }
  end rescue nil
end

def data_url(id)
  country = params[:iso]
  region  = params[:id_1]
  thresh  = params[:thresh]

  url =  "/api/indicators/#{ id }"
  url += "/#{ country }"       if country.present?
  url += "/#{ region }"        if region.present?
  url += "?thresh=#{ thresh }" if thresh.present?

  url.to_s
end
