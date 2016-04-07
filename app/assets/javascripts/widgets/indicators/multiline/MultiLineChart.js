define([
 'jquery',
 'd3',
 'underscore',
 'handlebars',
 'mps',
 'text!widgets/templates/indicators/line/linechart-tooltip.handlebars'
], function($, d3, _, Handlebars, mps, tooltipTpl){

var LineChart = function(options) {
  this.svg;
  this.options = options;
  this.parent = options.parent;
  this.data = options.data;
  this.indicators = options.indicators;
  this.unit = options.unit
  this.unitname = options.unitname;
  this.rangeX = options.rangeX;
  this.rangeY = options.rangeY;
  this.lock = options.lock;
  this.templateTooltip = Handlebars.compile(tooltipTpl);

  this.sizing = options.sizing;
  this.innerPadding = options.innerPadding;
  this.namespace = new Date().valueOf().toString();

  this.color = ['#5B80A0','#bebcc2','#E98300'];

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
  this.destroy();
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
  this.x.domain(this.rangeX);

  // this.y = d3.scale.linear().range([this.height,this.options.innerPadding.top]);
  this.y = d3.scale.linear().range([this.height - this.options.innerPadding.bottom,this.options.innerPadding.top]);
  this.y.domain(this.rangeY);

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


LineChart.prototype._drawAxes = function() {
  var self = this;
  var tickSizeX = ($(window).width() > 1025) ? 1 : 2;
  var tickFormatY = (this.unit != 'percentage') ? "s" : ".2f";
  this.xAxis = d3.svg.axis()
                 .scale(self.x)
                 .ticks(d3.time.year, tickSizeX)
                 .orient("bottom")
                 .tickFormat(d3.time.format("%Y"));

  this.yAxis = d3.svg.axis()
                 .scale(self.y)
                 .tickSize(-this.height, 0)
                 .orient("left")
                 .tickFormat(d3.format(tickFormatY));

  this.svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + (this.height - this.sizing.top) + ")")
    .call(this.xAxis);

  this.svg.append("g")
      .attr("class", "y axis")
      .call(this.yAxis)
    .selectAll("text")
      .attr("y", -10)
      .attr("x", 5)
      .style("text-anchor", "start");
};

LineChart.prototype._drawLine = function(group, data, i) {
  var self = this;
    group.append("path")
      .datum(data)
      .attr("transform", "translate(0,"+ (-self.sizing.top -self.innerPadding.top + 5) +")")
      .attr("class", "line")
      .attr("d", self.line)
      .style('stroke',self.color[i])
};

LineChart.prototype._drawTicks = function(group, data, i) {
  var self = this;
  group.selectAll('circle.dot')
    .data(data)
    .enter().append('circle')
      .attr('class', 'dot')
      .attr('r', 5)
      .attr('cx', function(d) { return self.x(d[self.xKey]);})
      .attr('cy', function(d) { return self.y(d[self.yKey]) -self.sizing.top -self.innerPadding.top + 5;})
      .style('fill',self.color[i])
};


LineChart.prototype._drawAverages = function() {
  var self = this;
  var averages = _.map(self.data, function(d,i){
    var txtaverage;
    var average = _.reduce(d, function(memo, num) {
      return memo + num.value;
    }, 0) / d.length;

    switch(self.unit) {
      case 'hectares':
        txtaverage = d3.format(",.0f")(average) + ' '+ self.unitname;
      break;
      case 'percentage':
        txtaverage = d3.format(".0f")(average) + ' '+ self.unitname;
      break;
      case 'tg-c':
        txtaverage = d3.format(",.0f")(average) + ' '+ self.unitname;
      break;
      case 'mt-co2':
        txtaverage = d3.format(",.0f")(average) + ' '+ self.unitname;
      break
      case 'mt-co2e':
        txtaverage = d3.format(",.0f")(average) + ' '+ self.unitname;
      break
    }
    return { average: txtaverage , color: self.color[i] };
  });
  // Publish average to its parent (MultiLineChartIndicator)
  self.parent._drawAverage(averages);
};


LineChart.prototype._drawLegend = function() {
  var self = this;
  var legend = _.map(self.indicators,function(indicator,i){
    return {
      name: indicator.name,
      color: self.color[i],
      // We need to ensure that the data is in order
      visible: !!self.data[i]
    }
  })
  self.parent._drawLegend(legend);
};

LineChart.prototype._drawTooltip = function() {
  var self = this;
  var data = data;

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
  var datum = self.data;
  var info = [];
  var x0 = x0;
  var formatDate = d3.time.format("%Y");
  var bisectDate = d3.bisector(function(d) { return d.year; }).left;
  _.each(datum, function(data,ix){
    var i  = bisectDate(data, x0, 1),
        d0 = data[i - 1],
        d1 = data[i],
        d = (d0 && d1 && (x0 - d0.year > d1.year - x0)) ? d1 : d0;
    if (!!d) {
      var format = (self.unit != 'percentage') ? ".3s" : ".2f",
          xyear = self.x(d.year),
          year = formatDate(d.year),
          value = d3.format(format)(d.value) + ' ' + self.unitname;
      // Positioner
      self.positioner
        .style('visibility', 'visible')
        .attr('x1', xyear + self.sizing.left)
        .attr('x2', xyear + self.sizing.left)

      // Tooltip
      self.tooltip.transition()
        .duration(125)
        .style('visibility', 'visible');

      info.push({ color: self.color[ix], value: value, year: year })
    }
  });
  if(!!info.length) {
    self.tooltip
      .classed("is-reflect", is_reflect)
      // .html('<span class="data">' + info[0].year + '</span>' + info[0].value )
      .html(this.templateTooltip({ year: info[0].year, tootip_info: info }))

      .style('left', (($(self.positioner[0]).offset().left)) + 'px')
      .style('top', (d3.event.pageY) + 'px');
  }
};

LineChart.prototype.setListeners = function() {
  var formatDate = d3.time.format("%Y");
  var bisectDate = d3.bisector(function(d) { return d.year; }).left;
  var data = this.data;
  var self = this;
  if (self.lock) {
    this.subcriptions = [
      mps.subscribe('LineChart/mouseout'+this.options.slug+this.options.id,function(){
        if (!!self.svg) {
          self.positioner
            .classed("is-reflect", false)
            .style("visibility", "hidden");
          self.tooltip
            .classed("is-reflect", false)
            .style("visibility", "hidden");
        }
      }),
      mps.subscribe('LineChart/mousemove'+this.options.slug+this.options.id,function(x0){
        if (!!self.svg) {
          self.setTooltip(x0,true);
        }
      })
    ]
  }
};






LineChart.prototype.render = function() {
  var self = this;
  if (!!this.svg) {
    _.each(this.data, function(d, i){
      var group = self.svg.append("g")
        .attr("class", "focus")
        .attr("width", self.width)
        .attr("height", self.height)
        .attr("transform",
          "translate(" + self.sizing.left + "," + self.sizing.top + ")");

      self._drawLine(group,d,i);
      self._drawTicks(group,d,i);

    })
    self._drawAxes();
    self._drawTooltip();
    self._drawAverages();
    self._drawLegend();
  }
};

LineChart.prototype.destroy = function() {
  if (!!this.tooltip) {
    this.tooltip.remove();
  }
  if (this.subcriptions) {
    for (var i = 0; i < this.subcriptions.length; i++) {
      mps.unsubscribe(this.subcriptions[i]);
    }
  }
};


return LineChart;

});
