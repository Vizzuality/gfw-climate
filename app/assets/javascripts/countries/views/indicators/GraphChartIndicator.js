define([
  'd3',
  'moment',
  'underscore',
  'handlebars',
  'countries/models/IndicatorsModel',
  'countries/views/show/IndicatorView',
  'text!countries/templates/indicators/lineGraph.handlebars'
], function(d3, moment, _, Handlebars, IndicatorsModel, IndicatorView, tpl) {

  'use strict';

  var GraphIndicator = IndicatorView.extend({

    el: '.graph-container',

    template: Handlebars.compile(tpl),

    events: function() {
      return _.extend({}, IndicatorView.prototype.events, {});
    },

    initialize: function() {
      this.constructor.__super__.initialize.apply(this);
      this.model = IndicatorsModel;

      // this._getData();
      // this.render();
    },

    _getData: function(ind) {
      // API call
      return this.model.getByParams(ind);
    },

    _drawGraph: function() {
      this.ticks = [];

      var margin = {
        top: 35,
        right: 20,
        bottom: 30,
        left: 58
      },

      width = 525 - margin.left - margin.right,
      height = 300 - margin.top - margin.bottom;

      // Ranges
      var x = d3.time.scale().range([0, width]),
          y = d3.scale.linear().range([height, 0]);

      // Line
      var valueline = d3.svg.line()
          .interpolate("cardinal")
          .x(function(d) {
            return x(d.year);
          })
          .y(function(d) {
            return y(d.loss);
          });

      // SVG Canvas
      var svg = d3.select('.graph-container > .content')
        .append('svg')
          .attr('width', width + margin.left + margin.right)
          .attr('height', height + margin.top + margin.bottom)
          .attr('class', 'line-chart')
        .append('g')
          .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

      // Vertical line positioner
      var positioner = svg.append('svg:line')
          .attr('x1', 0)
          .attr('y1', 0)
          .attr('x2', 0)
          .attr('y2', height)
          .style('visibility', 'hidden')
          .style('stroke', '#aaa');

      // Data
      var data = [];

      this.data.forEach(function(d) {

        // if (Number(d.year % 2) === 0) {

          data.push({
            year: moment(d.year + '-01-01'),
            loss: d.loss
          });
        // }

      });

      // Axes
      var xAxis = d3.svg.axis().scale(x).orient('bottom').tickSize(1)
        .ticks(data.length).tickSize(0).tickPadding(10).tickFormat(function(d) {
          return String(moment(d).format('YYYY')).replace(',', '');
        });

      var yAxis = d3.svg.axis().scale(y).orient('left').ticks(data.length).tickSize(0).tickPadding(10);

      // Scale range of the data
      x.domain(d3.extent(data, function(d) { return d.year; }));

      y.domain([0, d3.max(data, function(d) { return d.loss; })]);


      // Add valueline path
      svg.append('path')
        .attr('class', 'line')
        .attr('d', valueline(data));


      // Add scatterplote
      svg.selectAll('circle.dot')
      .data(data)
      .enter().append('circle')
        .attr('class', 'dot')
        .attr('r', 5)
        .attr('cx', function(d) { return x(d.year);})
        .attr('cy', function(d) { return y(d.loss);})
        // .on('mouseover', function(d) {
        //   tooltip.transition()
        //     .duration(200)
        //     .style('opacity', 1);
        //   tooltip.html('<span class="data">' + d.loss + '</span>'  + ' ha in ' + d.year.format('YYYY'))
        //     .style('left', (d3.event.pageX - 125) + 'px')
        //     .style('top', (d3.event.pageY - 28) + 'px');
        //   })
        // .on('mouseout', function(d) {
        //   tooltip.transition()
        //     .duration(500)
        //     .style('opacity', 0);
        // });


      var bisecDate = d3.bisector(function(d) { return d.year; }).left;


      // Animate positioner
      d3.select('.graph-container')
        .on("mouseout", function() {
          // positioner.style("visibility", "hidden");
          tooltip.transition()
            .duration(500)
            .style('opacity', 0);
        });
        // .on('mousemove', function() {
        //   positioner.style("visibility", "visible");
        //   var cx = d3.mouse(this)[0] + margin.left;


        //   // var index = Math.round(x.invert(d3.mouse(this)[0]));

        //     var x0 = x.invert(d3.mouse(this)[0] - margin.left),
        //       index = bisecDate(data, x0, 1);

        //     console.log(index);

        //     console.log(data[index]);

        //     console.log(cx);

        //     // console.log(d3.mouse(this)[0] - margin.left);

        //     // positioner
        //     //   .attr('x1', xPos)
        //     //   .attr('x2', xPos);

        //     // if (data[index]) {

        //     //   tooltip.html('<span class="data">' + data[index].loss + '</span>'  + ' ha in ' + data[index].year.format('YYYY'))
        //     //   tooltip.transition()
        //     //     .duration(200)
        //     //     .style('opacity', 1)
        //     //     .style("top", "-20px")
        //     //     .style("left", (cx - 162) + "px");
        //     // };
        // });



      // Add X axis
      svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis);

      // Add Y axis
      svg.append('g')
        .attr('class', 'y axis')
        .call(yAxis);

      // Tooltip
      var tooltip = d3.select('.graph-container').append('div')
          .attr('class', 'tooltip')
          .style('opacity', 0);
    },

    render: function(ind) {
      this.$el.html(this.template);
      var self = this;

      //Here, we retrieve the data for the first option in tabs
      var data = this._getData(ind);

      $.when($, data).done(function() {
        console.log(data);
        console.log(data.responseJSON);
        // self._drawGraph(data);
      });


      return this;
    }

  });

  return GraphIndicator;

});
