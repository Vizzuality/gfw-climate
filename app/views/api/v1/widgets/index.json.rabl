collection @widgets, root: 'widgets'

attributes :id, :name, :default

node(:data)       { |widget| widget.data_url('widgets', widget.id, @default_filter) }
node(:tabs)       { |widget| default_tabs(widget)                                   }
node(:indicators) { |widget| default_indicators(widget)                             }

def default_tabs(widget)
  widget.tabs.select { |tab| tab['default'] == true } rescue nil
end

def default_indicators(widget)
  widget.indicators.select { |indicator| indicator['default'] == true } rescue nil
end