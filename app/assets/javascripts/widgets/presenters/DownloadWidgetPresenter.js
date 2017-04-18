/**
 * The DownloadWigdetPresenter class for the DownloadWidget view.
 *º
 * @return DownloadWigdetPresenter class.
 */
define([
  'backbone',
  'underscore',
  'mps',
  'map/presenters/PresenterClass'
], function(Backbone, _, mps, PresenterClass) {

  'use strict';

  var DownloadModel = Backbone.Model.extend({

    defaults: {
      showFeedback: false,
      title: 'Download data',
      subtitle: '',
      iso: '',
      indicators: [],
      data: '',
      thresh: 30,
      start_date: '',
      end_date: '',
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

    getDownloadLink: function() {
      var model = this.model.toJSON();
      var data = {
        iso: model.iso,
        start_date: model.start_date,
        end_date: model.end_date,
        thresh: model.thresh,
      };

      data['indicator_ids[]'] = model.indicators.join(',') || '';
      return window.gfw.config.CLIMATE_API_HOST + '/api/downloads?' + $.param(data);
    },

    goBack: function() {
      this.model.set({ showFeedback: false });
      this.view.render(this.parseData(this.widget));
    },

    submit: function(data) {
      data.showFeedback= true;
      this.model.set(data);
      this.view.render(this.parseData(this.widget));
      var url = this.getDownloadLink();
      var download = window.open(url);
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

    parseTreshold: function() {
      var model = this.model.toJSON();
      var threshs = [10, 15, 20, 25, 30];
      return threshs.map(function(thresh) {
        return {
          selected: thresh === model.thresh,
          label: thresh,
          value: thresh
        }
      })
    },

    parseData: function(widget) {
      if (!widget) return {
        title: model.title,
        subtitle: 'No data download available'
      };

      var model = this.model.toJSON();
      var data = {
        title: model.title,
        subtitle: widget.name,
        treshold: this.parseTreshold(),
        showFeedback: model.showFeedback,
        data: []
      };
      if (model.showFeedback) {
        data.downloadLink = this.getDownloadLink();
      }

      widget.indicators.forEach(function(indicator, index) {
        if (indicator.name === model.name) {
          data.start_date = this.parseDates(indicator.range, model.start_date);
          data.end_date = this.parseDates(indicator.range, model.end_date);
        }
        var selected = !model.indicators.length && index === 0
          ? true
          : model.indicators.indexOf(''+indicator.id) > -1
        data.data.push({
          selected: selected,
          label: indicator.name + ' (' + indicator.unit + ')',
          value: indicator.id
        });
      }, this);
      if (!data.start_date || !data.end_date) {
        data.start_date = this.parseDates(widget.tabs[0].range)
        data.end_date = this.parseDates(widget.tabs[0].range)
      }
      return data;
    },

    // /**
    //  * Application subscriptions.
    //  */
    _subscriptions: [{
      'DownloadWidget/open': function(status, widget) {
        if (this.model.attributes.showFeedback) this.model.set({ showFeedback: false });
        this.widget = widget;
        var data = status;
        data.iso = widget.slugw;
        this.updateStatus(data);
        this.view.render(this.parseData(this.widget));
        this.view.show();
      }
    }]
  });

  return DownloadWigdetPresenter;
});
