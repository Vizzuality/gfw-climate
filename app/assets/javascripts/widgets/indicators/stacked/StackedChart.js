define([
  'jquery', 'd3', 'underscore', 'enquire'
], function (
  $, d3, _, enquire
) {

  var svg, stacked, color, arc;

  var StackedChart = function (options) {
    this.options = options;
    this.data = options.data;

    enquire.register("screen and (max-width:" + window.gfw.config.GFW_MOBILE + "px)", {
      match: _.bind(function () {
        this.mobile = true;
      }, this)
    });

    this.sizing = options.sizing;
    this.innerPadding = options.innerPadding;

    this.parentWidth = $(this.options.el).outerWidth();
    this.parentHeight = $(this.options.el).outerHeight();
    this.width = this.parentWidth - this.sizing.left - this.sizing.right,
      // this.height = this.parentHeight - this.sizing.top - this.sizing.bottom;

    this.height = function () {
      if (this.mobile) {
        return this.parentHeight - this.sizing.top - this.sizing.bottom - 40;
      } else {
        return this.parentHeight - this.sizing.top - this.sizing.bottom;
      }
    }.bind(this)();

    this._createEl();
    this._createDefs();
    this._createScales();

    // $(window).resize(_.debounce(this.resize.bind(this), 100));
  };


  StackedChart.prototype._createEl = function () {
    svg = d3.select(this.options.el)
      .append("svg")
      .attr('class', 'stackedChart')
      .attr("width", this.parentWidth)
      .attr("height", this.parentHeight)
  };

  StackedChart.prototype._createDefs = function () {
    svg.append("defs").append("clipPath")
      .attr("id", "clip")
      .append("rect")
      .attr("width", this.width)
      .attr("height", this.height);
  };

  StackedChart.prototype._createScales = function () {
    var x = d3.scaleBand()
      .rangeRound([this.innerPadding.left, this.width - this.innerPadding.right])
      .paddingInner(0.05)
      .align(0.1);

    var y = d3.scaleLinear()
      .rangeRound([this.height, 0]);

    var z = d3.scaleOrdinal()
      .range(['#5B809E', '#5B809E', '#B6B6BA', '#E2E2E3']);


    var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom")
      .tickFormat(d3.time.format("%b"));

    var yAxis = d3.svg.axis()
      .scale(y)
      .orient("right");
  };

  StackedChart.prototype._createStacked = function () {
    stacked = d3.layout.stack()
      .value(function(d) { return d.value})
  };

  StackedChart.prototype.render = function () {
    debugger;
    if (!!this.data.length) {
      var stacked = svg.selectAll(".stacked")
        .data(stacked(this.data))
        .enter().append("g")
        .attr("class", "layer")
        .style("fill", function(d, i) { return z(i); });

      stacked.selectAll("rect")
          .data(function(d) { return d; })
        .enter().append("rect")
          .attr("x", function(d) { return x(d.x); })
          .attr("y", function(d) { return y(d.y + d.y0); })
          .attr("height", function(d) { return y(d.y0) - y(d.y + d.y0); })
          .attr("width", x.rangeBand() - 1);

      svg.append("g")
          .attr("class", "axis axis--x")
          .attr("transform", "translate(0," + this.height + ")")
          .call(xAxis);

      svg.append("g")
          .attr("class", "axis axis--y")
          .attr("transform", "translate(" + this.width + ",0)")
          .call(yAxis);

      // this._createLegend(this.mobile, this.parentHeight);
    }
  };

  StackedChart.prototype._createLegend = function (mobile, mobileHeight) {
    var self = this;
    var legendDotSize = 12;
    var legendSpacing = 4;
    var widgetHeightMobile = mobileHeight;

    var legend = svg.selectAll('.legend')
      .data(color.domain())
      .enter()
      .append('g')
      .attr('class', 'legend')
      .attr('transform', function (d, i) {
        var height = legendDotSize + legendSpacing * 2;
        var offset = height * color.domain().length / 2;

        if (mobile) {
          var horz = 40 + i * 100;
          var vert = widgetHeightMobile - height / 2 - 5;
          return 'translate(' + horz + ',' + vert + ')';
        } else {
          var horz = 0;
          var vert = i * height - offset + self.height / 2;
          return 'translate(' + horz + ',' + vert + ')';
        }
      });

    legend.append('circle')
      .attr("cx", (legendDotSize + 2) / 2)
      .attr("cy", legendDotSize / 4 + 1)
      .attr("r", legendDotSize / 2)
      .attr('class', 'legend-dot')
      .style('fill', color)
      .style('stroke', color)

    legend.append('text')
      .attr('x', legendDotSize + 2 + legendSpacing)
      .attr('y', legendDotSize + 2 - legendSpacing)
      .attr('class', 'legend-text')
      .text(function (d) { return d; });
  };

  return StackedChart;
});
