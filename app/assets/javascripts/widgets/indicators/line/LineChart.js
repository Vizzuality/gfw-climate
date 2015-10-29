define([
 'jquery', 'd3', 'underscore',
 'widgets/indicators/line/line_chart_context',
 'widgets/indicators/line/line_chart_interactionHandler'
], function(
  $, d3, _,
  LineChartContext, LineChartInteractionHandler
) {

var LineChart = function(options) {
  this.svg;
  this.options = options;
  this.data = options.data;
  this.unit = options.unit

  this.sizing = options.sizing;
  this.innerPadding = options.innerPadding;

  this.parentWidth = $(this.options.el).outerWidth();
  this.parentHeight = $(this.options.el).outerHeight();
  this.width = this.parentWidth - this.sizing.left - this.sizing.right,
  this.height = this.parentHeight - this.sizing.top - this.sizing.bottom;
  if (!!this.parentWidth && !!this.parentHeight) {
    this._createEl();
    this._createDefs();
    this._createScales();
  }

  $(window).resize(_.debounce(this.resize.bind(this), 100));
};

LineChart.prototype.offResize = function() {
  $(window).off('resize');
};

LineChart.prototype.resize = function() {
  this.offResize();
  $(this.options.el).find('svg').remove();
  new LineChart(this.options).render();
};

LineChart.prototype._createEl = function() {
  this.svg = d3.select(this.options.el)
    .append("svg")
      .attr('class', 'lineChart')
      .attr("width", this.parentWidth)
      .attr("height", this.parentHeight);
};

LineChart.prototype._createScales = function() {
  var self = this;
  this.xKey = this.options.keys.x;
  this.yKey = this.options.keys.y;

  this.x = d3.time.scale().range([this.options.innerPadding.left, this.width - this.options.innerPadding.right]);
  this.x.domain(d3.extent(this.data.map(function(d) {
    return d[self.xKey];
  })));

  this.y = d3.scale.linear().range([this.height - this.options.innerPadding.bottom, 10 + this.options.innerPadding.top]);
  this.y.domain([0, d3.max(this.data.map(function(d) { return d[self.yKey]; }))]);

  this.line = d3.svg.line()
    .interpolate('cardinal')
    .x(function(d) { return self.x(d[self.xKey]); })
    .y(function(d) { return self.y(d[self.yKey]); });



};

LineChart.prototype._createDefs = function() {
  this.svg.append("defs").append("clipPath")
    .attr("id", "clip")
  .append("rect")
    .attr("width", this.width)
    .attr("height", this.height);
};

LineChart.prototype._drawAxes = function(group) {
  var self = this;
  var tickFormatY = (this.unit != 'percentage') ? "s" : ".2f";
  this.xAxis = d3.svg.axis().scale(self.x).ticks(d3.time.year, 1).tickSize(-this.width, 0).orient("bottom").tickFormat(d3.time.format("%Y"));;
  this.yAxis = d3.svg.axis().scale(self.y).tickSize(-this.height, 0).orient("left").tickFormat(d3.format(tickFormatY));

  group.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + this.height + ")")
    .call(this.xAxis);

  group.append("g")
      .attr("class", "y axis")
      .call(this.yAxis)
    .selectAll("text")
      .attr("y", -10)
      .attr("x", 5)
      .style("text-anchor", "start");
};

LineChart.prototype._drawLine = function(group) {
  var self = this;
  group.append("path")
    .datum(this.data)
    .attr("class", "line")
    .attr("d", self.line);
};

LineChart.prototype._drawTicks = function() {
  var self = this;
  this.svg.selectAll('circle.dot')
  .data(this.data)
  .enter().append('circle')
    .attr('class', 'dot')
    .attr('r', 5)
    .attr('cx', function(d) { return self.x(d[self.xKey]);})
    .attr('cy', function(d) { return self.y(d[self.yKey]);});
};


LineChart.prototype._drawTooltip = function() {
  var formatDate = d3.time.format("%Y");
  var bisectDate = d3.bisector(function(d) { return d.year; }).left;
  // Tooltip
  this.tooltip = d3.select('body').append('div')
    .attr('class', 'linegraph-tooltip')
    .style('visibility', 'hidden')

  this.positioner = this.svg.append('svg:line')
    .attr('x1', 0)
    .attr('y1', 0)
    .attr('x2', 0)
    .attr('y2', this.height)
    .style('visibility', 'hidden')
    .style('stroke', '#DDD');

  var data = this.data;
  var self = this;

  this.svg
    .on("mouseout", function() {
      self.positioner.style("visibility", "hidden");
      self.tooltip.style("visibility", "hidden");
    })
    .on("mouseover", function() {
      self.positioner.style("visibility", "visible");
      self.tooltip.style("visibility", "visible");
    })
    .on('mousemove', function() {
      var x0 = self.x.invert(d3.mouse(this)[0]),
          i  = bisectDate(self.data, x0, 1),
          d0 = data[i - 1],
          d1 = data[i],
          d = (d0 && d1 && (x0 - d0.year > d1.year - x0)) ? d1 : d0;

      if (!!d) {
        var format = (self.unit != 'percentage') ? ".3s" : ".2f",
            xyear = self.x(d.year),
            year = formatDate(d.year),
            value = (self.unit != 'percentage') ? d3.format(format)(d.value)+' '+ self.unit : d3.format(format)(d.value);
        // Positioner
        self.positioner
          .attr('x1', xyear + self.sizing.left)
          .attr('x2', xyear + self.sizing.left)

        // Tooltip
        self.tooltip.transition()
          .duration(125)
          .style('visibility', 'visible');
        self.tooltip.html('<span class="data">' + year + '</span>' + value )
          .style('left', (d3.event.pageX) + 'px')
          .style('top', (d3.event.pageY) + 'px');
      }
    });
};


LineChart.prototype._setupHandlers = function() {
  var eventInterceptor = this.svg.append("rect")
    .attr("class", "overlay")
    .attr("width", this.width)
    .attr("height", this.height)
    .attr("transform", "translate(" + this.sizing.left + "," + this.sizing.top + ")");
};

LineChart.prototype.render = function() {
  if (!!this.data.length && !!this.svg) {
    var group = this.svg.append("g")
      .attr("class", "focus")
      .attr("transform",
        "translate(" + this.sizing.left + "," + this.sizing.top + ")");

    this._drawAxes(group);
    this._drawLine(group);
    this._drawTicks();
    this._drawTooltip();
    // this._setupHandlers();
    // this._drawContext(group);
  }
};

return LineChart;

});
