define([
  'backbone',
  'compare/views/index/CompareSelectorsView',
  'compare/views/index/CompareGridView',
  'compare/views/index/CompareModalView',
  'compare/views/index/CompareFixedHeaderView',
  'compare/views/index/CompareGridButtonBoxView',
  'compare/views/index/CompareWidgetsModalView',
  'compare/views/index/CompareSwitcherView',
  // Common views
  'views/SourceModalView',
  'views/ToolbarView',
  'widgets/views/ShareWidgetView',

], function(Backbone, CompareSelectorsView, CompareGridView, CompareModalView, CompareFixedHeaderView, CompareGridButtonBoxView, CompareWidgetsModalView, CompareSwitcherView, SourceModalView, ToolbarView, ShareWidgetView) {

  var CompareIndexView = Backbone.View.extend({

    initialize:function() {
      enquire.register("screen and (max-width:"+window.gfw.config.GFW_MOBILE+"px)", {
        match: _.bind(function(){
          this.mobile = true;
        },this)
      });

      enquire.register("screen and (min-width:"+window.gfw.config.GFW_MOBILE+"px)", {
        match: _.bind(function(){
          this.mobile = false;
        },this)
      });

      new CompareSelectorsView();
      new CompareGridView();
      new CompareModalView();
      new CompareGridButtonBoxView();
      new CompareWidgetsModalView();
      // Common views
      new SourceModalView();
      new ToolbarView();
      new ShareWidgetView();


      if (this.mobile) {
        new CompareSwitcherView();
      } else {
        new CompareFixedHeaderView();
      }
    }

  });

  return CompareIndexView;

});
