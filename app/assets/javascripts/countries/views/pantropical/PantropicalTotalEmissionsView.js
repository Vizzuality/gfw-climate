define([
  'backbone',
  'd3'

], function(Backbone, d3) {

  'use strict';

  var TotalEmissionsView = Backbone.View.extend({

    initialize: function() {
      this.render();
    },

    render: function() {
      var self = this;
      $('#totalEmissionsChart').css({
        width: '100%',
        height: '400px',
        backgroundColor: '#fff'
      });

      d3.csv('/patropical_total_emissions.csv', function(data){
        self._parseData(data);
      });
    },

    _parseData: function(data) {
      var dataList = [];
      _.each(data[0], function(value, key) {
        dataList.push({
          date: key,
          value: Math.round(value),
          x: key,
          y: value
        });
      });

      this._renderChart({
        elem: '#totalEmissionsChart',
        barWidth: 30,
        barSeparation: 45,
        data: dataList,
        hover: true,
        decimals: 0,
        loader: 'is-loading',
        interpolate: 'cardinal',
        dateFormat: '%Y',
        unit: '',
        margin: {
          top: 30,
          right: 40,
          bottom: 40,
          left: 55,
          xaxis: 10,
          tooltip: 3.5
        }
      });
    },

    _renderChart: function(params) {
      var elem = params.elem;
      var elemAttr = elem.replace(/[#]|[.]/g, '');
      var $el = $(elem);
      var contentWidth = $el.width();
      var contentHeight = $el.height();
      var data = params.data;
      var dateFormat = params.dateFormat || '%Y';
      var hover = params.hover;
      var interpolate = params.interpolate || 'linear';
      var loader = params.loader || null;
      var infoWindow = params.infoWindowText || '';
      var decimals = params.decimals || 0;
      var unit = params.unit || '';
      var margin = params.margin || {
        top: 30,
        right: 0,
        bottom: 40,
        left: 0,
        xaxis: 10,
        tooltip: 1.8
      };

      $el.addClass('graph-line');

      var width = contentWidth,
          height = contentHeight;

      var parseDate = d3.time.format('%Y').parse;
      var bisectDate = d3.bisector(function(d) { return d.date; }).left;

      var width = width - margin.left - margin.right,
          height = height - margin.top - margin.bottom;

      var x = d3.time.scale()
          .range([0, width]);

      var y = d3.scale.linear()
          .range([height, 0]);

      var xAxis = d3.svg.axis()
          .scale(x)
          .orient('bottom')
          .tickPadding(10)
          .outerTickSize(0)
          .tickFormat(d3.time.format(dateFormat));

      var yAxis = d3.svg.axis()
          .scale(y)
          .orient('left')
          .ticks(7)
          .innerTickSize(-(width+50))
          .outerTickSize(0)
          .tickPadding(4);
          // .tickFormat('');

      var line = d3.svg.line()
          .x(function(d) { return x(d.date); })
          .y(function(d) { return y(d.value); })
          .interpolate(interpolate);

      var svg = d3.select(elem).append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
          .attr('transform', 'translate('+margin.left+',' + margin.top + ')');

      data.forEach(function(d) {
        d.date = parseDate(d.date);
      });

      x.domain(d3.extent(data, function(d) { return d.date; })).nice();
      y.domain(d3.extent(data, function(d) { return d.value ; })).nice();

      function customYAxis(g) {
        g.selectAll('text')
          .attr('x', 0)
          .attr('dy', -5);
      }

      svg.append('g')
        .attr('class', 'y axis')
        .attr('transform', 'translate(-45,0)')        
        .call(yAxis)
        .call(customYAxis);

      svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + (height) + ')')
        .call(xAxis);

      svg.append('path')
          .datum(data)
          .attr('class', 'line')
          .attr('d', line);

      svg.append('g')
          .attr('transform', 'translate(-5, -10)').append('text')
          .attr('class', 'unit')
          .attr('x', function(d) { return 0 })
          .attr('y', '-10')
          .attr('dy', '.35em')
          .attr('text-anchor', 'start')
          .text(function(d) { return unit; });

      function mousemove() {
        var x0 = x.invert(d3.mouse(this)[0]),
            i = bisectDate(data, x0, 1),
            d0 = data[i - 1],
            d1 = data[i];

        if(d0 && d0.date && d1 && d1.date) {
          var d = x0 - d0.date > d1.date - x0 ? d1 : d0;
          focus.attr('transform', 'translate(' + x(d.date) + ',' + y(d.value) + ')');

          // Move trail
          trail.attr('transform', 'translate(' + x(d.date) + ', '+y(d.value)+')');
          trailLine.attr('y2', (height) - y(d.value));

          // Update tooltip
          d3.select(tooltipEl)
            .style('left', ( (x(d.date) + margin.left) + (radius/2) - margin.tooltip - (tooltipW / 2) ) + 'px')
            .style('top', ( (y(d.value) + margin.top) - (tooltipH + (tooltipH/3)) + (radius / 2) - margin.tooltip ) + 'px')
            .style('display', 'block');

          d3.select(tooltipEl)
            .select('.title')
            .text(infoWindow + ' ' + d.value);

          d3.select(tooltipEl)
            .select('.value')
            .text(d.x).append('span')
            .attr('class', 'tooltip-unit')
            .text(unit);
        }
      }

      if(loader) {
        $el.removeClass(loader);
      }

      var tooltipEl = elem+'-tooltip';
      var tooltip = d3.select(elem)
        .insert('div', 'svg')
          .attr('id', elemAttr+'-tooltip')
          .attr('class', 'tooltip-graph')

      var tooltipW = $(tooltipEl).width();
      var tooltipH = $(tooltipEl).height();

      tooltip.append('div')
        .attr('class', 'content');
      tooltip.append('div')
        .attr('class', 'bottom');

      var tooltipContent = d3.select(tooltipEl)
        .select('.content');

      tooltipContent.append('div')
        .attr('class', 'title')
        .text(infoWindow);
      tooltipContent.append('div')
        .attr('class', 'value number');

      /** Trail **/
      var trail = svg.append('g');
      var trailLine = trail.append('line')
        .attr('class', 'trail')
        .style('display', 'none')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', 0)
        .attr('y2', 50);

      var radius = 4;
      var focus = svg.append('g')
        .attr('class', 'focus')
        .style('display', 'none');

      focus.append('circle')
        .attr('r', radius);

      svg.append('rect')
        .attr('class', 'overlay')
        .attr('width', width)
        .attr('height', height)
        .on('mouseover', function() {
          focus.style('display', null);
          trailLine.style('display', null);
          d3.select(tooltipEl)
            .style('display', 'block');
        })
        .on('mouseout', function() {
          focus.style('display', 'none');
          trailLine.style('display', 'none');
          d3.select(tooltipEl)
            .style('display', 'none');
        })
        .on('mousemove', mousemove);
    },
  });

  return TotalEmissionsView;

});
