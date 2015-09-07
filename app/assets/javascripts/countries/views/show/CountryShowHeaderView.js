define([
  'backbone',
  'mps',
  'countries/models/CountryModel'
], function(Backbone, mps, CountryModel) {

  var CountryShowHeaderView = Backbone.View.extend({

    el: '#headerCountry',

    events: {
      'change #areaSelector': '_setJurisdictions',
      'click #customizeReports': '_openReportPanel'
    },

    initialize: function(arguments) {
      this.model = CountryModel;
      this._populateJurisdictions();
    },

    _openReportPanel: function() {
      mps.publish('ReportsPanel/open', []);
    },

    _populateJurisdictions: function() {
      var jurisdictions =this.model.get('jurisdictions');
      var options = '<option value="default">select jurisdiction</option>';
      var $select = $('#areaSelector');

      jurisdictions.forEach(function(jurisdiction) {
        options += '<option value="' + jurisdiction.id + '">' + jurisdiction.name + '</option>';
      });

      $select.html(options);
    },

    _setJurisdictions: function(e) {
      var jurisdiction;
      if (e) {
        jurisdiction = e.currentTarget;
      }

      if (jurisdiction.value !== 'default'  && jurisdiction.value !== '') {
        Backbone.history.navigate('/countries/' + this.model.get('iso') + '/' + jurisdiction.value, {trigger: true});
      }
    }

  });

  return CountryShowHeaderView;

});
