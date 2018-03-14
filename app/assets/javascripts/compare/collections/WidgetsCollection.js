define(['backbone', 'jquery'], function(Backbone, $) {
  var WidgetsCollection = Backbone.Model.extend({
    url: '/api/widgets/',

    parse: function(data) {
      return data;
    }
  });

  return WidgetsCollection;
});
