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
      data:      @widget.data_url('indicators', indicator['id'], @default_filter),
      default:   indicator['default'],
    }
  end rescue nil
end