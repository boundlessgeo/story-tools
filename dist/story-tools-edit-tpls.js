angular.module("storytools.edit.templates", []).run(["$templateCache", function($templateCache) {$templateCache.put("boxes/bounds-editor.html","<div><div class=\"box-bounds-map col-lg-4\" style=\"height: 10em;\"></div><button>Use Current Map Bounds</button> <button>Use Combined Bounds of Selected Layers</button></div>");
$templateCache.put("boxes/box-chooser.html","<div><button ng-click=boxesCtrl.newStoryBox()>New StoryBox</button><table class=\"table table-condensed\"><thead><tr><th>Title</th><th>Start Time</th><th>End Time</th><th>Delete</th></tr></thead><tbody><tr ng-class=\"boxesCtrl.editingBox == box ? \'active\' : \'\'\" ng-repeat=\"box in boxesCtrl.boxes\"><td ng-click=boxesCtrl.editBox(box) style=\"cursor: pointer;\">{{ box.title }}</td><td>{{ box.start }}</td><td>{{ box.end }}</td><td><i ng-click=boxesCtrl.deleteBox(box) style=\"cursor: pointer;\" class=\"glyphicon glyphicon-trash\"></i></td></tr></tbody></table></div>");
$templateCache.put("boxes/box-editor.html","<div ng-if=boxesCtrl.editingBox><tabset ng-init=\"boxBoundsEditorSelected = false\" class=clearfix><tab heading=Contents><box-contents-editor></box-contents-editor></tab><tab heading=Bounds select=\"boxBoundsEditorSelected = true\" deselect=\"boxBoundsEditorSelected = false\"><box-bounds-editor selected=boxBoundsEditorSelected></box-bounds-editor></tab><tab heading=Layers><box-layers-editor></box-layers-editor></tab><tab heading=Layout><box-layout-editor></box-layout-editor></tab></tabset><button class=btn-primary ng-click=boxesCtrl.acceptEdit()>OK</button> <button ng-click=boxesCtrl.cancelEdit()>Cancel</button></div>");
$templateCache.put("boxes/contents-editor.html","<form name=boxContents><div class=col-lg-2><div class=form-group><label for=title>Title</label> <input ng-model=editBox.title ng-required class=form-control id=title placeholder=Title></div><div class=form-group><label for=description>Description</label> <textarea ng-model=editBox.description class=form-control id=description placeholder=Description></textarea></div></div><div class=col-lg-2><div class=form-group><label for=startTime>Start Time</label> <input ng-model=editBox.startTime class=form-control id=startTime placeholder=\"Start time\"></div><div class=form-group><label for=endTime>End Time</label> <input ng-model=editBox.endTime class=form-control id=endTime placeholder=\"End time\"></div></div><div class=col-lg-2><div class=form-group><label for=playbackRate>Playback Rate</label> <input type=number class=form-control id=playbackRate><select class=form-control><option>Seconds</option><option>Minutes</option></select></div><div class=form-group><label for=timestep>Timestep</label> <input type=number class=form-control id=timestep><select class=form-control><option>Minutes</option><option>Hours</option><option>Weeks</option><option>Months</option><option>Years</option></select></div></div></form>");
$templateCache.put("boxes/layers-editor.html","<div class=todo>Optional editing of layer visibility</div><div class=todo>Once toggled, is visibility \'inherited\' from the previous box? Or is it required to explicitly set for each box?</div>");
$templateCache.put("boxes/layout-editor.html","<div class=todo>Customize layout for the box.</div>");
$templateCache.put("pins/pin-chooser.html","<div><table class=\"table table-condensed\"><thead><tr><th></th><th>Title</th><th>Start Time</th><th>End Time</th><th>Geometry</th><th>In Map</th><th>In Timeline</th><th></th></tr></thead><tbody><tr ng-repeat=\"pin in pinsCtrl.StoryPinLayerManager.storyPins\" ng-class=\"pinsCtrl.currentPin == pin ? \'active\' : \'\'\"><td><i ng-click=editPin(pin) style=\"cursor: pointer;\" class=\"glyphicon glyphicon-edit\"></i></td><td>{{ pin.title }}</td><td>{{ pin.start_time|isodate }}</td><td>{{ pin.end_time|isodate }}</td><td>{{ pin.getGeometry().getType() }}</td><td>{{ pin.in_map }}</td><td>{{ pin.in_timeline }}</td><td><i ng-click=pinsCtrl.deleteStoryPin(pin) style=\"cursor: pointer;\" class=\"glyphicon glyphicon-trash\"></i></td></tr></tbody></table></div>");
$templateCache.put("pins/pin-editor-form.html","<form name=pinForm class=\"form form-horizontal pin-editor-form\"><div class=form-group><label for=storyPinTitle>StoryPin Title</label> <input name=title ng-required=true ng-model=storyPin.title class=form-control type=text id=storyPinTitle placeholder=Title></div><div class=form-group><label for=storyPinAbstract>Content</label> <textarea ng-model=storyPin.content id=storyPinAbstract class=form-control rows=2 placeholder=Content></textarea></div><hr><div class=form-group><label>Location</label><div><div class=\"btn-group nopad\"><button class=btn ng-model=pinsCtrl.activeDrawTool btn-radio=\"\'Point\'\">Point</button> <button class=btn ng-model=pinsCtrl.activeDrawTool btn-radio=\"\'LineString\'\">Line</button> <button class=btn ng-model=pinsCtrl.activeDrawTool btn-radio=\"\'Polygon\'\">Polygon</button></div><div ng-if=storyPin.getGeometry() class=\"btn-group nopad pull-right\"><button class=btn ng-class=\"pinsCtrl.activeDrawTool == \'Modify\' ? \'active\' : null\" ng-click=\"pinsCtrl.activeDrawTool = \'Modify\'\">Edit</button> <button class=btn ng-click=pinsCtrl.deleteGeometry()>Delete</button></div></div></div><hr><div class=form-group><label>Start Time</label><st-date-time-field date-time=storyPin.start_time></st-date-time-field></div><div class=form-group><label>End Time</label><st-date-time-field date-time=storyPin.end_time></st-date-time-field></div><div ng-if=pinForm.$error.range class=ng-invalid>Start must be before End</div><table ng-if=showPointCoordinates() class=\"table table-bordered table-condensed table-hover\" style=\"background-color: white\"><tbody><tr><td>Latitude</td><td><input ng-model=point.latitude class=form-control type=number placeholder=DD.MMSSSS></td></tr><tr><td>Longitude</td><td><input ng-model=point.longitude class=form-control type=number placeholder=DD.MMSSSS></td></tr></tbody></table><hr><div class=form-group><label>Options</label><div><div class=checkbox><input ng-model=storyPin.in_timeline id=showInTimeline type=checkbox> <label for=showInTimeline>Show in Timeline</label></div><div class=checkbox><input ng-model=storyPin.in_map id=showInMap type=checkbox> <label for=showInMap>Show in Map</label></div></div></div></form>");
$templateCache.put("style/rules-editor.html","<div class=style-editor-item><div class=title>Rules</div><table class=controls><tbody><tr ng-repeat=\"rule in activeStyle.rules\" class=style-rule><td>{{ rule.name}}</td><td><color-editor st-model=rule.style.symbol property=fillColor ng-if=rule.style.symbol.fillColor></color-editor><color-editor st-model=rule.style.stroke property=strokeColor ng-if=rule.style.stroke.strokeColor></color-editor><number-editor st-model=rule.style.symbol property=size ng-if=\"rule.style.symbol.size != null\"></number-editor></td><td><button ng-click=deleteRule(rule)>&times;</button></td></tr></tbody></table></div>");
$templateCache.put("style/style-editor.html","<form name=editorForm><div class=style-type-header ng-if=control.default><div class=btn-group data-dropdown><button type=button class=\"btn btn-default dropdown-toggle\">Style: {{currentEditor.displayName}}<span class=caret></span></button><ul class=dropdown-menu role=menu><li ng-repeat=\"styleType in styleTypes\" ng-click=setActiveStyle(styleType)>{{styleType.displayName}}</li></ul></div></div><carousel interval=-1 no-wrap=false ng-if=control.carousel><slide ng-repeat=\"styleType in styleTypes\" active=styleType.active><div class=\"item {{styleType.displayName|lowercase}}\" data-slide-number={{$index}}><div class=slide-title>{{styleType.displayName}}</div></div></slide><div align=center class=\"left carousel-control\" carousel-prev on-prev=setActiveStyle><span class=\"glyphicon glyphicon-chevron-left\"></span></div><div align=center class=\"right carousel-control\" carousel-next on-next=setActiveStyle><span class=\"glyphicon glyphicon-chevron-right\"></span></div></carousel><div><style-type-editor ng-if=layer></style-type-editor><rules-editor ng-if=activeStyle.rules></rules-editor></div></form>");
$templateCache.put("time/date-time-field.html","<p class=input-group><input type=text iso-date-time class=form-control ng-model=dateTime placeholder=YYYY-MM-DDTHH:mm:ss> <span class=input-group-btn><button ng-click=setFromCurrentTime() title=\"Set From Current Time\"><i class=\"glyphicon glyphicon-time\"></i></button></span></p>");
$templateCache.put("style/types/class-point.html","<classify-editor attribute-filter=number show-method=true show-max-classes=true show-color-ramp=true></classify-editor><symbol-editor hide-color=true st-model=activeStyle show-graphic=true show-rotation=true></symbol-editor><stroke-editor st-model=activeStyle></stroke-editor><label-editor st-model=activeStyle></label-editor>");
$templateCache.put("style/types/class-polygon.html","<classify-editor attribute-filter=number show-method=true show-max-classes=true show-color-ramp=true></classify-editor><stroke-editor st-model=activeStyle></stroke-editor><label-editor st-model=activeStyle></label-editor>");
$templateCache.put("style/types/graduated-line.html","<classify-editor attribute-filter=number show-method=true show-color-ramp=false show-max-classes=true show-range=true show-rotation=true></classify-editor><stroke-editor st-model=activeStyle></stroke-editor><label-editor st-model=activeStyle></label-editor>");
$templateCache.put("style/types/graduated-point.html","<classify-editor attribute-filter=number show-method=true show-color-ramp=false show-max-classes=true show-range=true show-rotation=true></classify-editor><stroke-editor st-model=activeStyle></stroke-editor><label-editor st-model=activeStyle></label-editor>");
$templateCache.put("style/types/heatmap.html","<div class=style-editor-item><div class=title>Radius</div><div class=controls><number-editor st-model=activeStyle property=radius max=64></number-editor></div><div class=title>Opacity</div><div class=controls><number-editor st-model=activeStyle property=opacity min=0 step=.1 max=1></number-editor></div></div>");
$templateCache.put("style/types/simple-line.html","<stroke-editor st-model=activeStyle></stroke-editor><label-editor st-model=activeStyle></label-editor>");
$templateCache.put("style/types/simple-point.html","<symbol-editor st-model=activeStyle show-graphic=true show-rotation=true></symbol-editor><stroke-editor st-model=activeStyle></stroke-editor><label-editor st-model=activeStyle></label-editor>");
$templateCache.put("style/types/simple-polygon.html","<symbol-editor st-model=activeStyle></symbol-editor><stroke-editor st-model=activeStyle></stroke-editor><label-editor st-model=activeStyle></label-editor>");
$templateCache.put("style/types/unique-line.html","<classify-editor attribute-filter=unique show-method=false show-max-classes=true show-color-palette=true></classify-editor><stroke-editor st-model=activeStyle></stroke-editor><label-editor st-model=activeStyle></label-editor>");
$templateCache.put("style/types/unique-point.html","<classify-editor attribute-filter=unique show-method=false show-max-classes=true show-color-palette=true show-rotation=true></classify-editor><symbol-editor hide-color=true st-model=activeStyle show-graphic=true show-rotation=true></symbol-editor><stroke-editor st-model=activeStyle></stroke-editor><label-editor st-model=activeStyle></label-editor>");
$templateCache.put("style/types/unique-polygon.html","<classify-editor attribute-filter=unique show-method=false show-max-classes=true show-color-palette=true></classify-editor><stroke-editor st-model=activeStyle></stroke-editor><label-editor st-model=activeStyle></label-editor>");
$templateCache.put("style/widgets/attribute-combo.html","<div data-dropdown><button type=button class=dropdown-toggle>{{model[property]||\'Select Attribute\'}}<span class=caret></span></button><ul class=\"dropdown-menu scrollable-combo {{css}}\" role=menu><li ng-click=\"onChange(property, null)\">[ None ]</li><li ng-repeat=\"attribute in attributes\" ng-click=\"onChange(property, attribute)\">{{attribute}}</li></ul></div>");
$templateCache.put("style/widgets/classify-editor.html","<div class=style-editor-item><div class=title>Classification</div><div class=controls><attribute-combo title=\"Layer attribute\" filter={{attributeFilter}} on-change=changeClassifyProperty layer=layer st-model=activeStyle.classify css=classify-attribute></attribute-combo><div class=btn-group ng-if=showMaxClasses><input title=\"Number of rules\" class=btn-xs size=3 type=number min=2 step=1 max=99 ng-model=activeStyle.classify.maxClasses ng-change=changeClassifyProperty()></div><div class=btn-group ng-if=showFixedClasses><button class=btn ng-model=radioModel btn-radio=3>3</button> <button class=btn ng-model=radioModel btn-radio=5>5</button> <button class=btn ng-model=radioModel btn-radio=7>7</button></div></div><div class=controls><div class=btn-group data-dropdown ng-if=showColorRamp><button type=button class=dropdown-toggle><canvas data-color-ramp width=200 height=14 data-ramp=activeStyle.classify.colorRamp ng-if=activeStyle.classify.colorRamp></canvas><span ng-if=\"activeStyle.classify.colorRamp == null\">Color Ramp</span> <span class=caret></span></button><ul class=dropdown-menu role=menu><li ng-click=\"activeStyle.classify.colorRamp=null\">[ None ]</li><li ng-repeat=\"ramp in styleChoices.colorRamps\" ng-click=\"changeClassifyProperty(\'colorRamp\',ramp)\"><canvas data-color-ramp width=200 height=14 data-ramp=ramp></canvas></li></ul></div><div class=btn-group data-dropdown ng-if=showColorPalette><button type=button class=dropdown-toggle><span>{{ activeStyle.classify.colorPalette||\'Color Palette\'}}</span> <span class=caret></span></button><ul class=dropdown-menu role=menu><li ng-click=\"activeStyle.classify.colorPalette=null\">[ None ]</li><li class=clearfix ng-repeat=\"p in styleChoices.colorPalettes\" ng-click=\"changeClassifyProperty(\'colorPalette\',p.name)\"><div>{{ p.name }}</div><div class=color-square ng-repeat=\"c in p.vals\" style=\"background-color: {{ c }}\"></div></li></ul></div><div class=btn-group dropdown ng-if=showMethod><button type=button class=dropdown-toggle>{{activeStyle.classify.method || \'Method\'}}<span class=caret></span></button><ul class=dropdown-menu role=menu><li ng-repeat=\"method in styleChoices.classMethods\" ng-click=\"changeClassifyProperty(\'method\',method)\"><span>{{method}}</span></li></ul></div></div><div class=controls ng-if=showRange><div data-dropdown><button type=button class=dropdown-toggle>{{activeStyle.classify.range.min}} - {{activeStyle.classify.range.max}}<span class=caret></span></button><div class=dropdown-menu role=menu><label>Min:</label><input no-close size=3 name=classifyRangeMin type=number min=0 max={{activeStyle.classify.range.max}} ng-model=activeStyle.classify.range.min ng-change=changeClassifyProperty><br><label>Max:</label><input no-close size=3 name=classifyRangeMax type=number min={{activeStyle.classify.range.min}} max=200 ng-model=activeStyle.classify.range.max ng-change=changeClassifyProperty></div></div></div></div>");
$templateCache.put("style/widgets/color-editor.html","<div class=btn-group data-dropdown><button type=button class=dropdown-toggle><i ng-style=\"{\'backgroundColor\': stModel[property]}\" class=color-picker>&nbsp; &nbsp; &nbsp;</i> <span class=caret></span></button><ul no-close class=\"dropdown-menu color-select\" role=menu><input color-field ng-model=stModel[property]><div no-close colorpicker colorpicker-parent=true colorpicker-position=bottom type=button ng-model=stModel[property]></div></ul></div>");
$templateCache.put("style/widgets/graphic-editor.html","<div data-dropdown><button type=button class=dropdown-toggle><span data-current-symbol></span> <span class=caret></span></button><div class=\"dropdown-menu symbol-selector\" role=menu><div>Marks</div><div class=ol-marks></div><div ng-if=recent>Recent Icons</div><div class=recent-icons></div><button class=\"btn btn-small\" ng-click=showIconCommons()>Icon Commons</button></div></div>");
$templateCache.put("style/widgets/icon-commons-search.html","<div class=modal-header><h3 class=modal-title>Icon Commons</h3></div><div class=\"modal-body icon-commons-search\"><tabset type=pills><tab heading=Search select=viewTags()><input ng-model=_typeAhead type=text placeholder=\"Search By Tag\" typeahead-wait-ms=250 typeahead=\"tag for tag in getTags($viewValue)\" class=form-control typeahead-on-select=\"tagSelect($item, $model, $label)\"></tab></tabset><div class=\"clearfix icon-list\"><ul ng-if=icons><li ng-repeat=\"i in icons._icons\" ng-class=selectedClass(i)><img title={{i.name}} ng-src={{i.href}} ng-click=iconSelected(i) ng-dblclick=\"iconSelected(i, true)\"></li></ul></div><button ng-if=icons._more ng-click=loadMore() class=\"col-lg-4 col-lg-offset-4 btn btn-primary\">Load More</button></div><div class=modal-footer><button class=\"btn btn-primary\" ng-click=close()>OK</button> <button class=btn ng-click=dismiss()>Cancel</button></div>");
$templateCache.put("style/widgets/label-editor.html","<div ng-click=updateProperty(model) ng-form=label class=style-editor-item><div class=title>Label</div><div class=controls><attribute-combo title=\"Layer attribute\" layer=layer st-model=model css=label-attribute filter=nogeom></attribute-combo><number-editor title=\"Label text size\" st-model=model property=fontSize></number-editor></div><div class=controls><div dropdown title=\"Label text font\"><button type=button class=dropdown-toggle>{{model.fontFamily}} <span class=caret></span></button><ul class=\"dropdown-menu scrollable-combo font-family\" role=menu><li ng-repeat=\"family in styleChoices.fontFamily\" ng-click=\"model.fontFamily=family\">{{family}}</li></ul></div><color-editor title=\"Label text color\" st-model=model property=fillColor></color-editor><div class=btn-group><button title=\"Bold label text\" class=btn ng-model=styleModel.bold btn-checkbox ng-change=styleModelChange()><strong>B</strong></button> <button title=\"Underline label text\" class=btn ng-model=styleModel.underline ng-change=styleModelChange()><u>U</u></button> <button title=\"Italicize label text\" class=btn ng-model=styleModel.italic btn-checkbox ng-change=styleModelChange()><i>I</i></button> <button title=\"Halo label text\" class=btn ng-model=styleModel.halo ng-change=styleModelChange()>H</button> <button title=\"Dropshadow label text\" class=btn ng-model=styleModel.shadow ng-change=styleModelChange()>S</button></div></div></div>");
$templateCache.put("style/widgets/number-editor.html","<div data-dropdown><button type=button class=dropdown-toggle>{{stModel[property]||\'number\'}} <span class=caret></span></button><div class=dropdown-menu role=menu><input no-close size=3 type=number min={{min}} max={{max}} step={{step}} value=10 name=\"{{ property }}\" ng-model=stModel[property]></div></div>");
$templateCache.put("style/widgets/stroke-editor.html","<div ng-click=updateProperty(model) ng-form=stroke class=style-editor-item><div class=title>Stroke</div><div class=controls><div title=\"Outline style\" data-dropdown><button type=button class=dropdown-toggle>{{model.strokeStyle}} <span class=caret></span></button><ul class=dropdown-menu role=menu><li ng-repeat=\"style in styleChoices.strokeStyle\" ng-click=\"model.strokeStyle=style\">{{style}}</li></ul></div><number-editor title=\"Outline weight\" ng-hide=hideStrokeWidth st-model=model property=strokeWidth max=64></number-editor><color-editor title=\"Outline color\" st-model=model property=strokeColor></color-editor><number-editor title=\"Outline opacity\" st-model=model property=strokeOpacity max=100></number-editor></div></div>");
$templateCache.put("style/widgets/symbol-editor.html","<div ng-click=updateProperty(model) ng-form=symbol class=style-editor-item><div class=title>Symbol</div><div class=controls><graphic-editor title=\"Point symbol\" ng-if=showGraphic symbol=model></graphic-editor><number-editor title=\"Symbol size\" ng-if=showGraphic st-model=model property=size max=64></number-editor><color-editor title=\"Fill color\" ng-if=!hideColor st-model=model property=fillColor></color-editor><number-editor title=\"Fill opacity\" st-model=model property=fillOpacity max=100></number-editor><attribute-combo title=\"Rotation attribute\" layer=layer include=double ng-if=showRotation st-model=model property=rotationAttribute></attribute-combo><div title=\"Rotation units\" dropdown ng-if=showRotation><button type=button class=dropdown-toggle>{{model.rotationUnits}} <span class=caret></span></button><ul class=dropdown-menu role=menu><li ng-repeat=\"rotationUnit in styleChoices.rotationUnits\" ng-click=\"model.rotationUnits=rotationUnit\">{{rotationUnit}}</li></ul></div></div></div>");}]);