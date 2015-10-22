define([
  'backbone',
  'handlebars',
  'widgets/views/WidgetView',
  'countries/models/CountryModel',
  'text!countries/templates/country-subnational-grid.handlebars'
], function(Backbone, Handlebars, WidgetView, CountryModel, tpl) {

  var SubNationalView = Backbone.View.extend({

    el: '.gridgraphs--container',

    template: Handlebars.compile(tpl),

    initialize: function(options) {
      this.widgets = options.widgets;
      this.countryModel = CountryModel;
      var iso = sessionStorage.getItem('countryIso');

      this.countryModel.setCountry(iso)
    },

    _populateJurisdictions: function() {
      this.countryModel.fetch().done(function() {

        var jurisdictions = this.countryModel.get('jurisdictions');
        var $select = $('#jurisdictionSelector');
        var options = '<option value="default">select jurisdiction</option>';

        jurisdictions.forEach(function(jurisdiction) {
          options += '<option value="' + jurisdiction.id + '">' + jurisdiction.name + '</option>';
        });

        $select.html(options);

      }.bind(this));
    },


    render: function() {
      this.$el.html('');
      this.$el.html(this.template);

      this._populateJurisdictions();

      this.widgets.forEach(_.bind(function(widget) {
        widget.render()
        this.$el.addClass('.subnational-grid').append(widget.el);
      }, this));

      return this;
    }

  });

  return SubNationalView;

});
