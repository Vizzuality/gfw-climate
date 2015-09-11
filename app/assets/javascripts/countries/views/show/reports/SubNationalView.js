define([
  'backbone',
  'handlebars',
  'countries/models/CountryModel',
  'text!countries/templates/country-subnational-grid.handlebars'
], function(Bakcbone, Handlebars, CountryModel, tpl) {

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

    // _setJurisdictions: function(e) {
    //   var jurisdiction;
    //   if (e) {
    //     jurisdiction = e.currentTarget;
    //   }

    //   if (jurisdiction.value !== 'default'  && jurisdiction.value !== '') {
    //     Backbone.history.navigate('/countries/' + this.model.get('iso') + '/' + jurisdiction.value, {trigger: true});
    //   }
    // }

    render: function() {
      this.$el.html(this.template);

      this._populateJurisdictions();

      return this.$el.html()
    }

  });

  return SubNationalView;

});
