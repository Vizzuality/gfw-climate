require(["backbone","compare/router","compare/views/CompareIndexView"],function(i,t,e){"use strict";var n=i.View.extend({el:document.body,initialize:function(){this._initRouter(),this._initViews(),this._initApp()},_initApp:function(){i.History.started||i.history.start({pushState:!0})},_initRouter:function(){this.router=new t},_initViews:function(){new e}});new n});