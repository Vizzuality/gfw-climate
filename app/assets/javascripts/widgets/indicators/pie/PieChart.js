define([
 'jquery', 'd3', 'underscore',
], function(
  $, d3, _
) {

var svg, pie, color, arc;


var arrayColor = ['#5B80A0', '#b6b6ba'];

var PieChart = function(options) {
  this.options = options;
  this.data = options.data;

  this.sizing = options.sizing;
  this.innerPadding = options.innerPadding;

  color = d3.scale.ordinal()
            .range(arrayColor);
  this.parentWidth = $(this.options.el).outerWidth();
  this.parentHeight = $(this.options.el).outerHeight();
  this.width = this.parentWidth - this.sizing.left - this.sizing.right,
  this.height = this.parentHeight - this.sizing.top - this.sizing.bottom;

  this.radius = Math.min(this.width, this.height) / 2;
  arc = d3.svg.arc()
              .outerRadius(this.radius)
              .innerRadius(this.radius - 65);

  this._createEl();
  this._createDefs();
  this._createPie();

  $(window).resize(_.debounce(this.resize.bind(this), 100));
};

PieChart.prototype.offResize = function() {
  $(window).off('resize');
};

PieChart.prototype.resize = function() {
  this.offResize();
  $(this.options.el).find('svg').remove();
  new PieChart(this.options).render();
};

PieChart.prototype._createEl = function() {
  svg = d3.select(this.options.el)
    .append("svg")
      .attr('class', 'pieChart')
      .attr("width", this.parentWidth)
      .attr("height", this.parentHeight)
};

PieChart.prototype._createDefs = function() {
  svg.append("defs").append("clipPath")
    .attr("id", "clip")
  .append("rect")
    .attr("width", this.width)
    .attr("height", this.height);
};

PieChart.prototype._createPie = function() {
  pie = d3.layout.pie()
    .sort(null)
    .value(function(d) { return d.value})
};

PieChart.prototype.render = function() {
  if (!!this.data.length) {
    var g = svg.selectAll('.arc')
        .data(pie(this.data))
        .enter().append('g')
        .attr('class', 'arc')
        .attr('transform', 'translate(' + this.parentWidth / 2 + ', ' + this.parentHeight / 2 + ')');

    g.append('path')
      .attr('d', arc)
      .style('fill', function(d) { return color(d.data.name); })
      .attr('data-legend', function(d) { return d.data.name })
      .attr('data-legend-color', function(d) { return color(d.data.name); });

    g.append('text')
      .attr('transform', function(d) { return 'translate(' + arc.centroid(d) + ')'; })
      .attr('dy', '.35em')
      .style('text-anchor', 'middle')
      .text(function(d) { return d.data.value + '%'; });
  }
};

return PieChart;

});
