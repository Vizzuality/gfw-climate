define([
  'backbone',
  'handlebars',
  'compare/collections/CountriesCollection',
  'text!compare/templates/compareSelectorTpl.handlebars'
], function(Backbone, Handlebars, CountriesCollection, tpl) {

  var CompareSelectorsView = Backbone.View.extend({

    el: '#compareSelectorsView',

    collection: CountriesCollection,

    template: Handlebars.compile(tpl),

    initialize:function() {
      // Fetching data
      var complete = _.invoke([
        this.collection,
      ], 'fetch');

      $.when.apply($, complete).done(function() {
        this.render();
      }.bind(this));

    },

    getActiveCountries: function() {
      return _.where(this.collection.toJSON().countries, {'enabled' : true});
    },

    render: function() {
      var countries = this.getActiveCountries();
      this.$el.html(this.template({'countries': countries}))
    }

  });

  return CompareSelectorsView;

});
