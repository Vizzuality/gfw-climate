define([
  'backbone',
  'handlebars',
  'countries/models/CountryModel',
  'views/WidgetView',
  'text!countries/templates/country-subnational-grid.handlebars'
], function(Bakcbone, Handlebars, CountryModel, WidgetView, tpl) {

  var SubNationalView = Backbone.View.extend({

    el: '.reports-grid',

    template: Handlebars.compile(tpl),

    initialize: function(model) {
      this.model = model;
      this.countryModel = CountryModel;
    },

    _populateJurisdictions: function() {
      var jurisdictions = this.countryModel.get('jurisdictions');
      var options = '<option value="default">select jurisdiction</option>';
      var $select = $('#jurisdictionSelector');

      jurisdictions.forEach(function(jurisdiction) {
        options += '<option value="' + jurisdiction.id + '">' + jurisdiction.name + '</option>';
      });

      $select.html(options);
    },


    render: function() {
      var enabledWidgets = this.model.attributes.widgets;

      this.$el.html(this.template);

      this._populateJurisdictions();

      enabledWidgets.forEach(_.bind(function(widget, i) {
        this.$el.find('.subnational-grid').append(new WidgetView({id: widget}).render());
      }, this));

      this.$el.html();

      return this;
    }

  });

  return SubNationalView;

});
