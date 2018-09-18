object false

node :widget do
  {
    id:         @widget.id,
    name:       @widget.name,
    slug:       @widget.slug,
    type:       @widget.type,
    type_slug:  @widget.type_slug,
    type_chart: @widget.type_chart,
    tabs:       tabs,
    indicators: indicators
  }
end

def tabs
  @widget.tabs.map do |tab|
    {
      position:      tab['position'],
      name:          tab['name'],
      subname:       tab['subname'],
      ipcc:          tab['ipcc'],
      type:          tab['type'],
      range:         tab['range'],
      rangetype:     tab['rangetype'],
      switch:        tab['switch'],
      thresh:        tab['thresh'],
      default_thresh: tab['default_thresh'],
      threshunit:    tab['threshunit'],
      cumulative:    tab['cumulative'],
      sectionswitch: tab['sectionswitch'],
      template:      tab['template'],
      note:          tab['note'],
      default:       tab['default']
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
