/*! SnapSVGAnimator 2016-04-15 */
var SVGAnim=function(root){function updateMaskContent(a,b){var c=b.maskElement,d=a.getChildById(b.id);c.clear(),clone=d.el.clone(),clone.attr({visibility:"visible"}),c.append(clone)}function SVGAnim(a,b,c,d,e){function f(b){var c,e,f;for(void 0!==n.rootAnimator&&n.rootAnimator.dispose(),n.linkage={},f=a.DOMDocument.Timeline.length-1;f>-1;f-=1){if("undefined"==typeof a.DOMDocument.Timeline[f].linkageName){c=f;break}n.linkage[a.DOMDocument.Timeline[f].linkageName]=a.DOMDocument.Timeline[f]}e=n.resourceManager.m_data.DOMDocument.Timeline[c],n.mc=new MovieClip(e,n.s,n.resourceManager,id),l=setTimeout(g,1e3/d)}function g(){n.mc._animate(),clearTimeout(l),j&&(l=setTimeout(g,1e3/d))}function h(a){switch(a.keyCode){case 39:g();break;case 32:n.mc.playing?n.stop():n.play()}}function i(){function a(b,d){var e,f;for(f=0;f<d.children.length;f+=1){for(e=0;b>e;e+=1)c+="-";c+=d.children[f].id+":"+d.children[f].children.length,d.children[f].isMask&&(c+=" (MASK till:"+d.children[f].maskTill+")"),d.children[f].isMasked&&(c+=" (masked by: "+d.children[f].mask+")"),c+="<br/>",a(b+5,d.children[f])}}var b=document.getElementById("debug"),c="";b||(b=document.createElement("div"),b.id="debug",b.style.position="absolute",b.style.top="0",b.style.right="0",b.style.backgroundColor="black",b.style.color="white",b.style.padding="1em",document.body.appendChild(b)),c+=n.mc.id+"<br/>",c+=n.mc.m_currentFrameNo+"<br/>",a(2,n.mc),b.innerHTML=c}var j,k,l,m,n=this,o="#008460";n.version="1.2.1",m="Snap.svg Animator v"+n.version,e=e||{},d=d||24,b=b||100,c=c||100,k=e.autoplay||!0,j=k,n.debug=!1,SVGAnim.prototype.toString=function(){return m},n.MovieClip=MovieClip,n.resourceManager=new ResourceManager(a),n.s=new Snap(b,c),id=n.s.id,n.s.attr("id",id),n.s.attr("viewBox","0 0 "+b+" "+c),n.s.attr("preserveAspectRatio","xMidYMid meet"),f(n.s),n.debug&&(j=!1,window.addEventListener("keydown",h)),this.play=function(){n.mc.play(),j=!0},this.stop=function(){n.mc.stop(),j=!1},this.setLoop=function(a){n.mc.loops=a},n.debug&&setInterval(i,100),k?n.play():g()}SVGAnim.version="0.0.2";var GarbagePool=function(){this.EMPTY_POOL=[],this.REF_POOL=[]};GarbagePool.prototype.addEmpty=function(a){this.EMPTY_POOL.push(a)},GarbagePool.prototype.addRef=function(a,b){var c,d;for(c=0;c<this.REF_POOL.length;c+=1)if(this.REF_POOL[c].el.id==a.id){for(d=0;d<b.length;d+=1)this.REF_POOL[c].refs.push(b[d]);return}this.REF_POOL.push({el:a,refs:b})},GarbagePool.prototype.purge=function(){this.purgeEmptyPool(),this.purgeRefPool()},GarbagePool.prototype.purgeEmptyPool=function(){var a,b;for(a=this.EMPTY_POOL.length-1;a>-1;a-=1)b=this.EMPTY_POOL[a],0===b.children().length&&(b.remove(),this.EMPTY_POOL.splice(a,1))},GarbagePool.prototype.purgeRefPool=function(){var a,b,c,d;for(a=this.REF_POOL.length-1;a>-1;a-=1)for(d=this.REF_POOL[a],c=0,b=0;b<d.refs.length;b+=1)d.refs[b].removed&&(c+=1),c==d.refs.length&&(d.el.remove(),this.REF_POOL.splice(a,1))};var GP=new GarbagePool,Bitmap=function(a,b,c,d,e,f){var g=this,h=a.el;this.create=function(){var i,j;g.el=a.el.g(),g.id=d,g.el.attr({"class":"shape",token:g.id}),g.children=[],g.isMask=!1,g.isMasked=!1,g.mask=null,g.maskTill=null;for(var k=0;k<b.m_data.DOMDocument.Bitmaps.length;k++)if(b.m_data.DOMDocument.Bitmaps[k].charid==c){var l=b.m_data.DOMDocument.Bitmaps[k].bitmapPath,m=a.el.paper.image(l);g.el.add(m)}i=f.split(","),j=new Snap.Matrix(i[0],i[1],i[2],i[3],i[4],i[5]),g.el.transform(j),e&&0!==parseInt(e)?(afterMC=a.getChildById(parseInt(e)),afterMC.isMasked?afterMC.el.parent().before(g.el):afterMC.el.before(g.el)):h.add(g.el)},this.create()},Text=function(a,b,c,d,e,f,g){var h=this,i=a.el;this.create=function(){var g,j,k;for(h.el=a.el.g(),h.id=d,h.el.attr({"class":"text",token:h.id}),h.children=[],h.isMask=!1,h.isMasked=!1,h.mask=null,h.maskTill=null,g=0;g<b.m_data.DOMDocument.Text.length;g++)b.m_data.DOMDocument.Text[g].charid==c&&h.addText(b.m_data.DOMDocument.Text[g]);j=f.split(","),k=new Snap.Matrix(j[0],j[1],j[2],j[3],j[4],j[5]),h.el.transform(k),e&&0!==parseInt(e)?(afterMC=a.getChildById(parseInt(e)),afterMC.isMasked?afterMC.el.parent().before(h.el):afterMC.el.before(h.el)):i.add(h.el)},this.addText=function(a){var b,c,d,e,f,i,j,k,l,m,n,o,p;c=h.el.g(),o=g?g.split(","):[0,0,200,100],f=a.behaviour.lineMode,l=a.paras[0].alignment,n="single"==f?"central":"auto",i=a.paras[0].textRun[0].style.fontSize,j=a.paras[0].textRun[0].style.fontName,k=a.paras[0].textRun[0].style.fontColor,letterSpacing=a.paras[0].textRun[0].style.letterSpacing,"left"==l?m="start":"center"==l?m="middle":"right"==l&&(m="end"),p={"text-anchor":m,"dominant-baseline":n,"font-family":j,"font-size":i,"letter-spacing":letterSpacing,fill:k},"false"!==a.behaviour.isBorderDrawn&&(textRect=c.rect(o[0],o[1],o[2],o[3]),textRect.attr({stroke:"black",fill:"transparent"})),"single"==f?(b=c.text(0,0,a.txt),e=parseFloat(o[1])+parseFloat(o[3])/2):(b=h.multiLine(c,a,o,p),e=parseFloat(o[1])-2*parseFloat(a.paras[0].linespacing)),d="left"==l?parseFloat(o[0]):parseFloat(o[0])+parseFloat(o[2])/2,b.attr(p),b.transform("translate("+d+","+e+")")},this.multiLine=function(a,b,c,d){for(var e,f,g,h,i=(b.txt,[]),j="",k=parseFloat(c[2]),l=0;l>-1;)j+=b.txt.charAt(l),f=a.text(0,0,j),f.attr(d),h=f.getBBox(),h.w>k?(newIndex=j.lastIndexOf(" "),e=j.slice(0,newIndex),i.push(e),l=l-(j.length-e.length)+2,j=""):l+=1,l>=b.txt.length&&(e=j.slice(0,newIndex),i.push(e),l=-1),f.remove();return text=a.text(0,0,i),g=text.selectAll("tspan"),g.attr({x:0,dy:h.h+parseFloat(b.paras[0].linespacing)}),text},this.create()},Shape=function(a,b,c,d,e,f){function g(a){var b=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(a);return b?{r:parseInt(b[1],16),g:parseInt(b[2],16),b:parseInt(b[3],16)}:null}function h(a,b,c){var d,e;return d=i.el.image(a),e=d.pattern(0,0,b.width,b.height),e.attr({x:c.e,y:c.f}),e}var i=this,j=a.el;this.create=function(){var g,h,k,l;for(i.el=a.el.g(),i.id=d,i.el.attr({"class":"shape",token:i.id}),i.children=[],i.isMask=!1,i.isMasked=!1,i.mask=null,i.maskTill=null,g=0;g<b.m_data.DOMDocument.Shape.length;g++)if(b.m_data.DOMDocument.Shape[g].charid==c)for(h=0;h<b.m_data.DOMDocument.Shape[g].path.length;h++)i.addPath(g,h);k=f.split(","),l=new Snap.Matrix(k[0],k[1],k[2],k[3],k[4],k[5]),i.el.transform(l),e&&0!==parseInt(e)?(afterMC=a.getChildById(parseInt(e)),afterMC.isMasked?afterMC.el.parent().before(i.el):afterMC.el.before(i.el)):j.add(i.el)},this.addPath=function(a,c){var d;shape=i.el.path(),resourcePath=b.m_data.DOMDocument.Shape[a].path[c],d=resourcePath.d,shape.attr({fill:"transparent"}),shape.attr({d:d}),"Fill"==resourcePath.pathType?this.addFill(shape,resourcePath):"Stroke"==resourcePath.pathType&&this.addStroke(shape,resourcePath)},this.getFillColor=function(a){var b,c,d,e,f,g;return b=resourcePath.color,c=parseInt(b.substring(1,3),16),d=parseInt(b.substring(3,5),16),e=parseInt(b.substring(5,7),16),f=resourcePath.colorOpacity,g="rgba("+c+","+d+","+e+","+f+")"},this.getFillImage=function(b){var c,d,e,f,g=0;return c=b.patternTransform.split(","),g=0,d=new Snap.Matrix(c[g],c[g+1],c[g+1],c[g+3],c[g+4],c[g+5]),e=b.bitmapPath,f=a.el.paper.select("defs pattern image"),f&&f.attr("href")==e?fillImage=f.parent():fillImage=h(e,b,d),fillImage},this.getFillGradient=function(b,c,d){var e,f,h,i,j,k,l,m,n,o;for("linear"==c?(e=parseFloat(b.x1),f=parseFloat(b.y1),h=parseFloat(b.x2),i=parseFloat(b.y2),l="L(",l+=e+", ",l+=f+", ",l+=h+", ",l+=i+")"):(e=d.getBBox().x+d.getBBox().width/2+b.cx/10,f=d.getBBox().y+d.getBBox().height/2+b.cy/10,j=d.getBBox().x+d.getBBox().width/2+parseFloat(b.fx),k=d.getBBox().y+d.getBBox().height/2+parseFloat(b.fy),l="R(",l+=e+", ",l+=f+", ",l+=b.r+", ",l+=j+", ",l+=k+")"),n=0;n<b.stop.length;n+=1)o=g(b.stop[n].stopColor),l+="rgba("+o.r+","+o.g+","+o.b+","+b.stop[n].stopOpacity+")",l+=":",l+=b.stop[n].offset,n!==b.stop.length-1&&(l+="-");return m=a.el.paper.gradient(l)},this.addFill=function(a,b){var c,d,e,f,g;b.color&&(c=i.getFillColor(b),a.attr({fill:c})),b.image&&(f=b.image,d=i.getFillImage(f),a.attr({fill:d})),b.linearGradient&&(g=b.linearGradient,e=i.getFillGradient(g,"linear"),a.attr({fill:e})),b.radialGradient&&(g=b.radialGradient,e=i.getFillGradient(g,"radial",a),a.attr({fill:e}))},this.addStroke=function(a,b){var c,d,e,f,g;b.color&&(clr=b.color,c=parseInt(clr.substring(1,3),16),d=parseInt(clr.substring(3,5),16),e=parseInt(clr.substring(5,7),16),f=b.colorOpacity,g="rgba("+c+","+d+","+e+","+f+")",a.attr({stroke:g,strokeWidth:b.strokeWidth}))},this.create()},MovieClip=function(a,b,c,d,e,f){var g,h;parentEl="svg"==b.type?b:b.el,d&&(this.id=d),e&&(this.name=e),this.el=parentEl.g(),this.el.attr({"class":"movieclip",token:this.id}),this.transform=f,this.m_timeline=a,this.m_currentFrameNo=0,this.m_frameCount=this.m_timeline.frameCount,this._scripts={},this._labels=[],this.children=[],this.isMask=!1,this.isMasked=!1,this.mask=null,this.maskElement=null,this.maskTill=null,this.loops=!0,this.playing=!0,this.resourceManager=c,this.commandList=[],this.matrix=new Snap.Matrix,"undefined"!=typeof this.m_timeline.Label&&(this._labels=this.m_timeline.Label),void 0!==this.transform&&(g=this.transform,h=g.split(","),this.matrix=new Snap.Matrix(h[0],h[1],h[2],h[3],h[4],h[5]),this.el.transform(this.matrix))};MovieClip.prototype.addChild=function(a,b){b=b?b:0,this.insertAtIndex(a,b)},MovieClip.prototype._addChild=function(a,b){if(a.name&&(this[a.name]=a),b&&0!==parseInt(b)){var c=this.getChildById(parseInt(b));c.isMasked?c.el.parent().before(a.el):c.el.before(a.el)}else this.el.add(a.el)},MovieClip.prototype.getChildById=function(a){var b;for(b=0;b<this.children.length;b+=1)if(this.children[b].id==a)return this.children[b];return!1},MovieClip.prototype.getChildIndexById=function(a){var b;for(b=0;b<this.children.length;b+=1)if(this.children[b].id==a)return b;return!1},MovieClip.prototype.removeChildById=function(a){var b;for(b=0;b<this.children.length;b+=1)if(this.children[b].id==a)return void this.children.splice(b,1)},MovieClip.prototype.swapChildIndex=function(a,b){var c,d;for(c=0;c<this.children.length;c+=1)if(this.children[c].id==a){d=this.children.splice(c,1);break}for(c=0;c<this.children.length;c+=1)if(this.children[c].id==b){this.children.splice(c+1,0,d[0]);break}},MovieClip.prototype.insertAtIndex=function(a,b){var c;for(this._addChild(a,b),0===parseInt(b)&&this.children.unshift(a),c=0;c<this.children.length;c+=1)if(this.children[c].id==b){this.children.splice(c+1,0,a);break}},MovieClip.prototype.containsMask=function(){var a;for(a=0;a<this.children.length;a+=1)if(this.children[a].isMask)return!0;return!1},MovieClip.prototype.getFrameLabels=function(){return this._labels},MovieClip.prototype.getMatrix=function(){return this.matrix?this.matrix:new Snap.Matrix},MovieClip.prototype.getX=function(){var a=0;return this.matrix&&(a=this.matrix.x()),a},MovieClip.prototype.getY=function(){var a=0;return this.matrix&&(a=this.matrix.y()),a},MovieClip.prototype.mouseover=function(a){this.el.mouseover(a)},MovieClip.prototype.mouseout=function(a){this.el.mouseout(a)},MovieClip.prototype.mousedown=function(a){this.el.mousedown(a)},MovieClip.prototype.mousemove=function(a){this.el.mousemove(a)},MovieClip.prototype.click=function(a){this.el.click(a)},MovieClip.prototype.executeFrameScript=function(script){eval("(function () {"+script+"}).call(this);")},MovieClip.prototype.removeFrameScript=function(a){delete this._scripts[a]},MovieClip.prototype.addFrameScript=function(a,b){this._scripts[a]=b},MovieClip.prototype.getFrame=function(a){var b;for(b=0;b<this.m_timeline.Frame.length;b+=1)if(this.m_timeline.Frame[b].num==a)return this.m_timeline.Frame[b]},MovieClip.prototype._checkLoop=function(){if(this.m_currentFrameNo==this.m_frameCount){if(!this.loops)return;this._loop()}},MovieClip.prototype._loop=function(){var a,b,d,e,f;if(this.m_currentFrameNo=0,a=this.getFrame(this.m_currentFrameNo),!a)return void this.clearChildren();for(b=a.Command,d=0;d<this.children.length;d+=1){for(e=!1,child=this.children[d],c=0;c<b.length;++c)if(cmdData=b[c],f=cmdData.cmdType,"Place"==f&&parseInt(child.id)==parseInt(cmdData.objectId)){e=!0;break}e===!1&&(command=new CMD.RemoveObjectCommand(child.id),this.commandList.push(command))}},MovieClip.prototype.clearChildren=function(){var a,b,c;for(a=0;a<this.children.length;a+=1)b=this.children[a],c=new CMD.RemoveObjectCommand(b.id),this.commandList.push(c)},MovieClip.prototype._animate=function(){var a;for(this.step_1_animTimeline(),this.step_2_enterFrame(),this.step_4_frameConstructed(),this.step_5_frameScripts(),this.step_6_exitFrame(),a=0;a<this.children.length;a+=1)this.children[a]._animate&&this.children[a]._animate();GP.purge()},MovieClip.prototype._runCommands=function(a){var b,c,d,e,f;for(b=0;b<a.length;b+=1)switch(c=a[b],e=c.cmdType,d=null,e){case"Place":f=this.getChildById(c.objectId),f?(d=new CMD.MoveObjectCommand(c.objectId,c.transformMatrix),this.commandList.push(d),d=new CMD.UpdateObjectCommand(c.objectId,c.placeAfter),this.commandList.push(d)):(d=new CMD.PlaceObjectCommand(c.charid,c.objectId,c.name,c.placeAfter,c.transformMatrix,c.bounds),this.commandList.push(d));break;case"Move":d=new CMD.MoveObjectCommand(c.objectId,c.transformMatrix),this.commandList.push(d);break;case"Remove":d=new CMD.RemoveObjectCommand(c.objectId),this.commandList.push(d);break;case"UpdateZOrder":d=new CMD.UpdateObjectCommand(c.objectId,c.placeAfter),this.commandList.push(d);break;case"UpdateVisibility":d=new CMD.UpdateVisibilityCommand(c.objectId,c.visibility),this.commandList.push(d);break;case"UpdateColorTransform":d=new CMD.UpdateColorTransformCommand(c.objectId,c.colorMatrix),this.commandList.push(d);break;case"UpdateBlendMode":break;case"UpdateMask":d=new CMD.UpdateMaskCommand(c.objectId,c.maskTill),this.commandList.push(d);break;case"AddFrameScript":d=new CMD.AddFrameScriptCommand(c.scriptId,c.script),this.commandList.push(d);break;case"RemoveFrameScript":d=new CMD.RemoveFrameScriptCommand(c.scriptId),this.commandList.push(d);break;case"SetFrameLabel":d=new CMD.SetFrameLabelCommand(c.Name),this.commandList.push(d)}this.containsMask&&(d=new CMD.ApplyMaskCommand,this.commandList.push(d)),this.executeCommands(this.commandList,this.resourceManager)},MovieClip.prototype.step_1_animTimeline=function(a,b){"undefined"==typeof a&&(a=!1),"undefined"==typeof b&&(b=!1);var c,d;this.playing&&(this.commandList=[],this._checkLoop(),d=this.getFrame(this.m_currentFrameNo),this.m_currentFrameNo++,d&&(c=d.Command,this._runCommands(c)))},MovieClip.prototype.step_2_enterFrame=function(){},MovieClip.prototype.step_3_addPending=function(){},MovieClip.prototype.step_4_frameConstructed=function(){},MovieClip.prototype.step_5_frameScripts=function(){for(var a in this._scripts)this.executeFrameScript(this._scripts[a])},MovieClip.prototype.step_6_exitFrame=function(){},MovieClip.prototype.play=function(){this.playing=!0},MovieClip.prototype.stop=function(){this.playing=!1},MovieClip.prototype.gotoAndStop=function(a){this._gotoAndPlayStop(a,!0)},MovieClip.prototype.gotoAndPlay=function(a){this._gotoAndPlayStop(a,!1)},MovieClip.prototype._gotoAndPlayStop=function(a,b){if("string"==typeof a){for(var c=this.getFrameLabels(),d=!1,e=c.length-1;e>=0;e--)if(a===c[e].name){a=parseInt(c[e].frameNum)+1,d=!0;break}if(d===!1)return}if(!(1>a||a>this.m_frameCount)){if(a==this.m_currentFrameNo)return void(b===!1?this.play():this.stop());if(this.play(),a<this.m_currentFrameNo){var f=1==a;this._loopAround(!0,f)}for(;this.m_currentFrameNo<a;){var f=a==this.m_currentFrameNo;this.step_1_animTimeline(!0,f);for(var e=0;e<this.children.length;e+=1)this.children[e].step_1_animTimeline&&this.children[e].step_1_animTimeline(!0,f)}b===!1?this.play():this.stop(),this.step_4_frameConstructed(),this.step_5_frameScripts(),this.step_6_exitFrame()}},MovieClip.prototype._loopAround=function(a,b){"undefined"==typeof a&&(a=!1),"undefined"==typeof b&&(b=!1),this.commandList=[],this._checkLoop(),this.m_currentFrameNo=0,frame=this.getFrame(this.m_currentFrameNo),frame&&(commands=frame.Command,this._runCommands(commands))},MovieClip.prototype.executeCommands=function(a,b){var c;for(c=0;c<a.length;c++)void 0!==a[c]&&a[c].execute(this,b)},MovieClip.prototype.log=function(){if(this.id.indexOf("svg")>-1){var a=Array.prototype.slice.call(arguments);a.unshift(this.id.toUpperCase())}};var CMD={};CMD.PlaceObjectCommand=function(a,b,c,d,e,f){this.m_charID=a,this.m_objectID=b,this.m_name=c,this.m_placeAfter=d,this.m_transform=e,this.m_bounds=f},CMD.PlaceObjectCommand.prototype.execute=function(a,b){var c,d,e,f,g,h=b.getShape(this.m_charID),i=b.getBitmap(this.m_charID),j=b.getText(this.m_charID);null!==h&&void 0!==h?(d=new Shape(a,b,this.m_charID,this.m_objectID,this.m_placeAfter,this.m_transform),a.insertAtIndex(d,this.m_placeAfter)):null!==i&&void 0!==i?(e=new Bitmap(a,b,this.m_charID,this.m_objectID,this.m_placeAfter,this.m_transform),a.insertAtIndex(e,this.m_placeAfter)):null!==j&&void 0!==j?(c=new Text(a,b,this.m_charID,this.m_objectID,this.m_placeAfter,this.m_transform,this.m_bounds),a.insertAtIndex(c,this.m_placeAfter)):(f=b.getMovieClip(this.m_charID),f&&(g=new MovieClip(f,a,b,this.m_objectID,this.m_name,this.m_transform),a.insertAtIndex(g,this.m_placeAfter),g.play()))},CMD.MoveObjectCommand=function(a,b){this.m_objectID=a,this.m_transform=b},CMD.MoveObjectCommand.prototype.execute=function(a,b){var c,d,e;c=this.m_transform,d=c.split(","),e=new Snap.Matrix(d[0],d[1],d[2],d[3],d[4],d[5]),child=a.getChildById(this.m_objectID),child.matrix=e,child.el.transform(e)},CMD.UpdateObjectCommand=function(a,b){this.m_objectID=a,this.m_placeAfter=b},CMD.UpdateObjectCommand.prototype.execute=function(a,b){},CMD.RemoveObjectCommand=function(a){this.m_objectID=a},CMD.RemoveObjectCommand.prototype.execute=function(a,b){var c;c=a.getChildById(this.m_objectID),c.el.remove(),a.removeChildById(this.m_objectID)},CMD.UpdateVisibilityCommand=function(a,b){this.m_objectID=a,this.m_visibility=b},CMD.UpdateVisibilityCommand.prototype.execute=function(a,b){var c,d;c=a.getChildById(this.m_objectID),d="true"==this.m_visibility?"visible":"hidden",c.el.attr({visibility:d})},CMD.UpdateMaskCommand=function(a,b){this.m_objectID=a,this.m_maskTill=b},CMD.UpdateMaskCommand.prototype.execute=function(a,b){var c,d;maskContent=a.getChildById(this.m_objectID),maskContent.isMask=!0,maskContent.maskTill=this.m_maskTill,c=a.el.mask(),c.attr("mask-type","alpha"),clone=maskContent.el.clone(),clone.attr({visibility:"visible"}),d=c.toDefs(),d.append(clone),maskContent.maskElement=d,maskContent.el.attr({visibility:"hidden"})},CMD.ApplyMaskCommand=function(){},CMD.ApplyMaskCommand.prototype.execute=function(a,b){var c,d,e=!1,f=null,g=null,h=null;for(c=0;c<a.children.length;c+=1)child=a.children[c],child.isMask?(updateMaskContent(a,child),e=!0,f=child,g=child.maskElement,h=child.maskTill,d=a.el.g(),d.attr({"class":"maskGroup"}),child.el.after(d),d.attr({mask:g}),GP.addEmpty(d),GP.addRef(g,[d]),child.id==child.maskTill&&(e=!1)):e&&(d.prepend(child.el),child.isMasked=!0,child.mask=f.id,child.id==h&&(e=!1,f=null,h=null))},CMD.UpdateColorTransformCommand=function(a,b){this.m_objectID=a,this.m_colorMatrix=b},CMD.UpdateColorTransformCommand.prototype.execute=function(a,b){var c,d;c=a.getChildById(this.m_objectID),d=this.m_colorMatrix.split(",",7),c.el.attr({opacity:parseFloat(d[6])})},CMD.AddFrameScriptCommand=function(a,b){this.m_scriptID=a,this.m_script=b},CMD.AddFrameScriptCommand.prototype.execute=function(a,b){a.addFrameScript(this.m_scriptID,this.m_script)},CMD.RemoveFrameScriptCommand=function(a){this.m_scriptID=a},CMD.RemoveFrameScriptCommand.prototype.execute=function(a,b){a.removeFrameScript(this.m_scriptID)},CMD.SetFrameLabelCommand=function(a){this.m_labelName=a},CMD.SetFrameLabelCommand.prototype.execute=function(a,b){};var ResourceManager=function(a){var b;this.m_shapes=[],this.m_movieClips=[],this.m_bitmaps=[],this.m_text=[],this.m_data=a;for(var c=0;c<this.m_data.DOMDocument.Shape.length;c++){b=this.m_data.DOMDocument.Shape[c].charid;var d=this.m_data.DOMDocument.Shape[c];this.m_shapes[b]=d}for(var e=0;e<this.m_data.DOMDocument.Bitmaps.length;e++){b=this.m_data.DOMDocument.Bitmaps[e].charid;var f=this.m_data.DOMDocument.Bitmaps[e];this.m_bitmaps[b]=f}for(var g=0;g<this.m_data.DOMDocument.Text.length;g++){b=this.m_data.DOMDocument.Text[g].charid;var h=this.m_data.DOMDocument.Text[g];this.m_text[b]=h}if(void 0!==this.m_data.DOMDocument.Timeline)for(var i=0;i<this.m_data.DOMDocument.Timeline.length-1;i++){b=this.m_data.DOMDocument.Timeline[i].charid;var j=this.m_data.DOMDocument.Timeline[i];this.m_movieClips[b]=j}};return ResourceManager.prototype.getShape=function(a){return this.m_shapes[a]},ResourceManager.prototype.getMovieClip=function(a){return this.m_movieClips[a]},ResourceManager.prototype.getBitmap=function(a){return this.m_bitmaps[a]},ResourceManager.prototype.getText=function(a){return this.m_text[a]},window.SVGAnim=SVGAnim,SVGAnim}(window||this);
