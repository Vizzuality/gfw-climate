/**
 * The Analysis view.
 *
 * @return Analysis view
 */
define([
  'underscore',
  'enquire',
  'handlebars',
  'map/presenters/analysis/AnalysisResultsPresenter',
  'widgets/indicators/bars/BarChart',
  'text!map/templates/analysis/analysisResults.handlebars',
  'text!map/templates/analysis/analysisResultsChart.handlebars',
  'text!map/templates/analysis/analysisResultsFailure.handlebars',
], function(_, enquire, Handlebars, Presenter, BarChart, tpl, chartTpl, failureTpl) {

  'use strict';

  var AnalysisResultsModel = Backbone.Model.extend({
    defaults: {
      boxHidden: true
    }
  });


  var AnalysisResultsView = Backbone.View.extend({

    el: '#analysis-result',

    template: Handlebars.compile(tpl),

    templates: {
      chart: Handlebars.compile(chartTpl),
      failure: Handlebars.compile(failureTpl),
    },

    events:{
      'click #analysis-delete': '_deleteAnalysis',
      'click #analysis-subscribe': '_subscribe',
      'click .dropdown-button' :'_toggleDownloads',
      'click .canopy-button' : '_showCanopy',
      'click .close' : 'toogleAnalysis',
      'click #toggleIFL' : 'toogleIFL'
    },

    initialize: function() {
      this.model = new AnalysisResultsModel();
      this.presenter = new Presenter(this);
      this.$resultsHide = $('.results-hide');
      this.$tab = $('#analysis-tab');
      this.$analysisTab = $('#analysis-nav');
      enquire.register("screen and (min-width:"+window.gfw.config.GFW_MOBILE+"px)", {
        match: _.bind(function(){
          this.mobile = false;
        },this)
      });
      enquire.register("screen and (max-width:"+window.gfw.config.GFW_MOBILE+"px)", {
        match: _.bind(function(){
          this.mobile = true;
        },this)
      });
    },

    _cacheSelector: function() {
      this.$downloadDropdown = $('.download-dropdown');
      this.$subscribeButton = $('#analysis-subscribe');
      this.$switchIFLabels = $('.ifl-switch .label');
    },

    /**
     * Render analysis results.
     *
     */
    renderAnalysis: function(params) {
      this.setParams(params);
      this.$el.html(this.templates.chart(this.params)).removeClass('hidden');
      this._cacheSelector();
      this.$resultsHide.addClass('hidden');
      this.drawChart();
    },

    drawChart: function() {
      var data = this.parseData(this.presenter.status.get('results'));

      new BarChart({
        elem: '#loss-carbon-chart',
        barWidth: 30,
        barSeparation: 5,
        data: data,
        hover: true,
        loader: 'is-loading',
        interpolate: 'basis',
        unit: 'CO2T',
        unitZ: 'Ha',
        hasLine: true
      });
    },

    parseData: function(res) {
      var data = res.data.attributes;
      var barValues = _.map(data.co2LossByYear,function(v,k){return {year:k,value:v}});
      var lineValues = _.map(data.treeLossByYear,function(v,k){return {year:k,value:v}});
      var dataParsed = [];

      $.each(barValues, function(v,i) {
        if (this.year != 0 && this.year != 2015) {
          var valueSet = {};

          valueSet.y = this.value;
          valueSet.x = this.year;
          valueSet.LegendBar = "Gross carbon emissions";
          valueSet.LegendLine = "Tree cover loss";
          valueSet.color = '#d9d9d9';
          valueSet.lineColor = '#ff6699';
          valueSet.z = _.findWhere(lineValues, {'year': this.year }).value;

          dataParsed.push(valueSet);
        }
      });
      return dataParsed;
    },

    /**
     * Render failure analysis request message.
     */
    renderFailure: function() {
      // this._update(this.templates.failure());
      this.$el.html(this.templates.failure()).removeClass('hidden');
      this._cacheSelector();
      this.$resultsHide.addClass('hidden');
    },

    setParams: function(params){
      this.params = params;
      this.params.warning_text = (this.$analysisTab.find('li.active').data('analysis') === 'draw-tab');
      this.params.downloadVisible = ((this.params.loss || this.params.forestgain) && this.mobile) ? false : true;
      this.params.url = this.setDownloadLink(params.layer.slug);

    },

    _deleteAnalysis: function() {
      this.$resultsHide.removeClass('hidden');
      this.$el.addClass('hidden');
      this.presenter.deleteAnalysis();
      var title = this.params && this.params.layer ? this.params.layer.title : 'No layer title';
      ga('send', 'event', 'Map', 'Delete-Analysis', 'Layer: ' + title);
    },

    _deleteAnalysisView: function(){
      this.$resultsHide.removeClass('hidden');
      this.$el.addClass('hidden');
    },

    _subscribe: function() {
      this.presenter.subscribeAnalysis();
      ga('send', 'event', 'Map', 'Subscribe', 'Layer: ' + this.params.layer.title);
    },

    _toggleDownloads: function(e) {
      e && e.preventDefault();
      this.$downloadDropdown.toggleClass('hidden');
      ga('send', 'event', 'Map', 'Download', 'Downloads-' + 'Layer: ' + this.params.layer.title);
    },

    _showCanopy: function(e){
      e && e.preventDefault();
      this.presenter.showCanopy();
    },

    setDownloadLink: function(layer){
      var links = {
        'loss' : 'http://data.globalforestwatch.org/datasets/93ecbfa0542c42fdaa8454fa42a6cc27',
        'forestgain' : 'http://data.globalforestwatch.org/datasets/6c9f379a362e4926ad24b58444f4ba67',
        'forma' : 'http://data.globalforestwatch.org/datasets/39a527e300ff4146962a3c74ec476f64',
        'terrailoss' : 'http://www.terra-i.org/terra-i/data.html',
        'imazon' : 'http://www.imazongeo.org.br/doc/downloads.php',
        'fires' : 'https://earthdata.nasa.gov/data/near-real-time-data/firms',
        'modis' : 'http://data.globalforestwatch.org/datasets/e7bfe60d90ea4e5aa808eba4723ad3f8_0'

      }
      return links[layer];
    },

    toggleSubscribeButton: function(toggle) {
      this.$subscribeButton.toggleClass('disabled', toggle);
    },

    toogleAnalysis: function(to){
      this.$el.toggleClass('active', to);
    },

    toogleIFL: function(e){
      $(e.currentTarget).find('.onoffswitch').toggleClass('checked');
      this.$switchIFLabels.toggleClass('checked')
    }


  });

  return AnalysisResultsView;

});
