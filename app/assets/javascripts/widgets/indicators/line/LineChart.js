define([
 'jquery',
 'd3',
 'underscore',
 'mps',
 'widgets/indicators/line/line_chart_context',
 'widgets/indicators/line/line_chart_interactionHandler',
 'text!widgets/templates/indicators/line/linechart-tooltip.handlebars'

], function($, d3, _, mps, LineChartContext, LineChartInteractionHandler, tooltipTpl){

var LineChart = function(options) {
  this.svg;
  this.options = options;
  this.data = options.data;
  this.unit = options.unit
  this.range = options.range;
  this.templateTooltip = Handlebars.compile(tooltipTpl);

  this.color = ['#5B80A0','#bebcc2','#E98300'];

  this.sizing = options.sizing;
  this.innerPadding = options.innerPadding;
  this.namespace = new Date().valueOf().toString();

  this.parentWidth = $(this.options.el).outerWidth();
  this.parentHeight = $(this.options.el).outerHeight();
  this.width = this.parentWidth - this.sizing.left - this.sizing.right,
  this.height = this.parentHeight - this.sizing.top - this.sizing.bottom;
  if (!!this.parentWidth && !!this.parentHeight) {
    this._createEl();
    this._createDefs();
    this._createScales();
  }

  this.setListeners();
  // $(window).resize(_.debounce(this.resize.bind(this), 100))
  $(window).on('resize.namespace'+this.namespace, _.debounce(this.resize.bind(this), 100));
};

LineChart.prototype.offResize = function() {
  $(window).off('resize.namespace'+this.namespace);
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

  // this.y = d3.scale.linear().range([this.height,this.options.innerPadding.top]);
  this.y = d3.scale.linear().range([this.height - this.options.innerPadding.bottom,this.options.innerPadding.top]);
  this.y.domain(this.range);

  this.line = d3.svg.line()
    .interpolate('linear')
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
  this.xAxis = d3.svg.axis()
                 .scale(self.x)
                 .ticks(d3.time.year, 1)
                 .tickSize(6, 6)
                 .orient("bottom")
                 .tickFormat(d3.time.format("%Y"));

  this.yAxis = d3.svg.axis()
                 .scale(self.y)
                 .tickSize(-this.height, 0)
                 .orient("left")
                 .tickFormat(d3.format(tickFormatY));

  group.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + (this.height - this.sizing.top) + ")")
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
    .attr("transform", "translate(0,"+ -this.sizing.top +")")
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
  var self = this;

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


  this.svg
    .on("mouseenter", function() {
      self.positioner.style("visibility", "visible");
      self.tooltip.style("visibility", "visible");
    })
    .on('mousemove', function() {
      var x0 = self.x.invert(d3.mouse(this)[0]);
      self.setTooltip(x0,false);
      mps.publish('LineChart/mousemove'+self.options.slug_compare+self.options.id,[x0]);
    })
    .on("mouseleave", function() {
      self.positioner.style("visibility", "hidden");
      self.tooltip.style("visibility", "hidden");
      mps.publish('LineChart/mouseout'+self.options.slug_compare+self.options.id);
    })
};


LineChart.prototype.setTooltip = function(x0,is_reflect) {
  var self = this;
  var data = this.data;
  var info = [];
  var formatDate = d3.time.format("%Y");
  var bisectDate = d3.bisector(function(d) { return d.year; }).left;
  var x0 = x0,
      i  = bisectDate(self.data, x0, 1),
      d0 = data[i - 1],
      d1 = data[i],
      d = (d0 && d1 && (x0 - d0.year > d1.year - x0)) ? d1 : d0;

  if (!!d) {
    var format = (self.unit != 'percentage') ? ".3s" : ".2f",
        xyear = self.x(d.year),
        year = formatDate(d.year),
        value = d3.format(format)(d.value);
    // Positioner
    self.positioner
      .style('visibility', 'visible')
      .attr('x1', xyear + self.sizing.left)
      .attr('x2', xyear + self.sizing.left)

    // Tooltip
    self.tooltip.transition()
      .duration(125)
      .style('visibility', 'visible');

    info.push({ color: self.color[0], value: value, year: year })

    self.tooltip
      .classed("is-reflect", is_reflect)
      // .html('<span class="date">' + year + '</span>' + value )
      .html(this.templateTooltip({ unit: self.unit, year: info[0].year, tootip_info: info }))
      .style('left', (($(self.positioner[0]).offset().left)) + 'px')
      .style('top', (d3.event.pageY) + 'px');

  }
};

LineChart.prototype.setListeners = function() {
  var formatDate = d3.time.format("%Y");
  var bisectDate = d3.bisector(function(d) { return d.year; }).left;
  var data = this.data;
  var self = this;

  mps.subscribe('LineChart/mouseout'+this.options.slug+this.options.id,function(){
    if (!!self.svg) {
      self.positioner
        .classed("is-reflect", false)
        .style("visibility", "hidden");
      self.tooltip
        .classed("is-reflect", false)
        .style("visibility", "hidden");
    }
  });

  mps.subscribe('LineChart/mousemove'+this.options.slug+this.options.id,function(x0){
    if (!!self.svg) {
      self.setTooltip(x0,true);
    }
  });
};






LineChart.prototype.render = function() {
  if (!!this.data.length && !!this.svg) {
    var group = this.svg.append("g")
      .attr("class", "focus")
      .attr("width", this.width)
      .attr("height", this.height)
      .attr("transform",
        "translate(" + this.sizing.left + "," + this.sizing.top + ")");

    this._drawAxes(group);
    this._drawLine(group);
    this._drawTicks();
    this._drawTooltip();
  }
};

LineChart.prototype.destroy = function() {
  if (!!this.tooltip) {
    this.tooltip.remove();
  }
};


return LineChart;

});
