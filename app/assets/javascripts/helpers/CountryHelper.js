define(['d3', 'topojson'], function(d3, topojson) {
  var CountryHelper = {
    draw: function(topology, c, iso, options) {
      var country = topojson.feature(topology, topology.objects[c]);
      var width = options.width || 300;
      var height = options.height || 300;
      var el = '#' + iso;

      if ($('body').hasClass('is-compare-page')) {
        width = 150;
        height = 150;
      }

      if (!options.alerts) {
        width = 150;
        height = 150;
        el = el + ' a';
      }

      var svg = d3
        .select(el)
        .append('svg:svg')
        .attr('width', width)
        .attr('height', height);

      var projection = d3.geo.mercator().scale(1).translate([0, 0]);
      var path = d3.geo.path().projection(projection);

      var b = path.bounds((options && options.bounds) || country);
      var s =
        1 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height);
      var t = [
        (width - s * (b[1][0] + b[0][0])) / 2,
        (height - s * (b[1][1] + b[0][1])) / 2
      ];

      projection.scale(s).translate(t);

      svg
        .append('svg:path')
        .data([country])
        .attr('d', path)
        .attr(
          'class',
          options && options.bounds ? 'country_alt' : 'country_main'
        );

      if (options && options.alerts) {
        var forest = [];

        for (var i = 1; i < Object.keys(topology.objects).length; i++) {
          if (topology.objects[i].type === 'Point') {
            forest.push(
              topojson.feature(topology, topology.objects[i]).geometry
            );
          }
        }

        svg
          .append('svg:g')
          .selectAll('circle')
          .data(forest)
          .enter()
          .append('svg:circle')
          .attr('class', 'alert')
          .attr('cx', function(d) {
            var coordinates = projection([d.coordinates[0], d.coordinates[1]]);
            return coordinates[0];
          })
          .attr('cy', function(d) {
            var coordinates = projection([d.coordinates[0], d.coordinates[1]]);
            return coordinates[1];
          })
          .attr('r', 2)
          .style('fill', '#AAC600');
      }
      return country;
    }
  };

  return CountryHelper;
});
