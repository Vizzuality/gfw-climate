require(["jquery","underscore","backbone","countries/router","countries/views/CountryShowView","countries/views/CountryIndexView","countries/views/CountryModalView"],function(i,t,e,n,o,r,u){"use strict";var s=e.View.extend({el:document.body,initialize:function(){this._initRouter(),this._initViews(),this._initApp()},_initApp:function(){e.History.started||e.history.start({pushState:!0})},_initViews:function(){new o,new r,new u},_initRouter:function(){this.router=new n}});new s});