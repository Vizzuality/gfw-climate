define([
  'backbone'
], function(Backbone) {

  var WidgetModel = Backbone.Model.extend({

    url: '/api/widgets/',

    setUrl: function(id) {
      this.url += id;
    },

    getData: function(id, cb) {
      this.setUrl(id);
      $.ajax({
        url: this.url,
        success: function(data) {
          if (cb && typeof cb === 'function') {
            this.set(data.widget);
            cb();
          }
        }.bind(this),
        error: function(err) {
          throw err;
        }
      });
    }

  });

  return WidgetModel;

});
