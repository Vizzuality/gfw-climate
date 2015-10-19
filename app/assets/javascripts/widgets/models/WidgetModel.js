define([
  'backbone'
], function(Backbone) {

  var WidgetModel = Backbone.Model.extend({

    url: '/api/widgets/',

    initialize: function() {
      // this.url += this.id + '/' + this.get('iso');
    },

    // setUrl: function(id) {
    //   this.url += id;
    // },

    getData: function(params, cb) {
      this.url += params.id + '/' + params.iso;
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
