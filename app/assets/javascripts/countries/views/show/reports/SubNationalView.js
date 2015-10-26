define([
  'backbone',
  'handlebars',
  'widgets/views/WidgetView',
  'text!countries/templates/country-subnational-grid.handlebars'
], function(Backbone, Handlebars, WidgetView, tpl) {

  var SubNationalView = Backbone.View.extend({

    el: '.reports-grid',

    template: Handlebars.compile(tpl),

    initialize: function(options) {
      this.widgets = options.widgets;
      this.CountryModel = options.model;
    },

    _populateJurisdictions: function() {
      var jurisdictions = this.CountryModel.attributes.jurisdictions;
      var $select = $('#jurisdictionSelector');
      var options = '<option value="default">select jurisdiction</option>';

      jurisdictions.forEach(function(jurisdiction) {
        options += '<option value="' + jurisdiction.id + '">' + jurisdiction.name + '</option>';
      });

      $select.html(options);
    },


    render: function() {

      this.$el.html(this.template);

      this._populateJurisdictions();

      this.widgets.forEach(_.bind(function(id) {
        this.$el.find('.subnational-grid').append(new WidgetView({id: id}).start());
      }, this));

      this.$el.html();

      return this;
    }

  });

  return SubNationalView;

});
