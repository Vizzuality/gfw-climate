/**
 * The DownloadWigdetPresenter class for the DownloadWidget view.
 *º
 * @return DownloadWigdetPresenter class.
 */
define([
  'underscore',
  'mps',
  'map/presenters/PresenterClass'
], function(_, mps, PresenterClass) {

  'use strict';

  var DownloadModel = Backbone.Model.extend({

    defaults: {
      title: 'Download',
      subtitle: '',
      iso: '',
      indicators: [],
      data: '',
      threshold: 15,
      start_date: 2000,
      end_date: 2015,
      unit: 'Ha'
    },

    initialize: function(options) {
      this.options = _.extend(this.defaults, options);
    },
  });

  var DownloadWigdetPresenter = PresenterClass.extend({

    init: function(view) {
      this.view = view;
      this._super();
      this.model = new DownloadModel();
    },

    updateStatus: function(status) {
      this.model.set(status);
    },

    submit: function() {
      var model = this.model.toJSON();
      var data = {
        iso: model.iso,
        start_date: model.start_date,
        end_date: model.end_date,
        threshold: model.threshold,
      };

      var filteredIndicators = _.filter(model.indicators, function(indicator) {
        return indicator.tab == model.position;
      });

      data['indicator_ids[]'] = _.map(filteredIndicators, function(indicator) {
        return indicator.id;
      }).join(',');

      var url = window.gfw.config.CLIMATE_API_HOST + '/downloads?' + $.param(data);
      var download = window.open(url, '_blank');

      download.onbeforeunload = function() {
        console.log('TODO: download succesfull');
      }
    },

    parseDates: function(dates, current) {
      return _.map(dates, function(year) {
        return {
          selected: year === current,
          label: year,
          value: year
        }
      });
    },

    parseSwitchs: function(switchs, current) {
      return _.map(switchs, function(item) {
        return {
          selected: item.unitname === current,
          label: item.unitname,
          value: item.unit
        }
      });
    },

    parseTreshold: function() {
      // TODO: make it dynamic
      return [
        { selected: true, label: 15, value: 15 },
        { selected: false, label: 30, value: 30 }
      ]
    },

    parseData: function(widget) {
      var model = this.model.toJSON();
      var data = {
        treshold: this.parseTreshold(),
        title: model.title,
        subtitle: widget.name,
        data: [],
      };
      widget.tabs.forEach(function(tab) {
        if (tab.name === model.name) {
          data.start_date = this.parseDates(tab.range, model.start_date);
          data.end_date = this.parseDates(tab.range, model.end_date);
          data.units = this.parseSwitchs(tab.switch, model.unit);
        }
        data.data.push({
          selected: tab.name === model.name,
          label: tab.name,
          value: tab.name
        });
      }, this);
      return data;
    },

    // /**
    //  * Application subscriptions.
    //  */
    _subscriptions: [{
      'DownloadWidget/open': function(status, widget) {
        var data = status;
        data.iso = widget.slugw;
        data.indicators = widget.indicators;
        this.updateStatus(data);
        this.view.render(this.parseData(widget));
        this.view.show();
      }
    }]
  });

  return DownloadWigdetPresenter;
});
