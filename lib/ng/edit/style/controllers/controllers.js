(function() {
    'use strict';

    var module = angular.module('storytools.edit.style.controllers', []);

    function sldToJson(parentNode, mapping, transforms) {
      var style_obj = {};
      var css_nodes = parentNode.getElementsByTagName('sld:CssParameter');
      for (var i = 0, ii = css_nodes.length; i < ii; i++) {
        var node = css_nodes[i];
        var name = node.getAttribute('name');
        if (mapping[name] !== undefined) {
          var value = node.childNodes[0].nodeValue;
          if (transforms[name] !== undefined) {
            value = transforms[name](value);
          }
          style_obj[mapping[name]] = value;
        }
      }
      return style_obj;
    }

    function getChildValue(rule, tagName) {
      var node = rule.getElementsByTagName(tagName)[0];
      return node.childNodes[0].nodeValue;
    }

    function nodeExists(rule, tagName) {
      return (rule.getElementsByTagName(tagName).length > 0);
    }

    function getRotation(rule) {
      var rotation = rule.getElementsByTagName('sld:Rotation')[0];
      return getChildValue(rotation, 'ogc:PropertyName');
    }

    function getFillObject(rule) {
      var fill = rule.getElementsByTagName('sld:Fill')[0];
      var new_props = sldToJson(fill, {
        'fill': 'fillColor',
        'fill-opacity': 'fillOpacity',
      }, {
        'fill-opacity' : function(val) {
          return parseFloat(val) * 100;
        }
      });

      if (nodeExists(rule, 'sld:Size')) {
        new_props.size = parseInt(getChildValue(rule, 'sld:Size'));
      }

      if (nodeExists(rule, 'sld:WellKnownName')) {
        new_props.shape = getChildValue(rule, 'sld:WellKnownName');
      }

      if (nodeExists(rule, 'sld:Rotation')) {
        new_props.rotationAttribute = getRotation(rule);
      }

      return new_props;
    }

    function getStrokeObject(rule) {
      var stroke = rule.getElementsByTagName('sld:Stroke')[0];
      return sldToJson(stroke, {
        'stroke': 'strokeColor',
        'stroke-opacity': 'strokeOpacity',
        'stroke-dasharray': 'strokeStyle',
        'stroke-width': 'strokeWidth'
      }, {
        'stroke-opacity' : function(val) {
          return parseFloat(val) * 100;
        },
        'stroke-width' : function(val) {
          return parseInt(val);
        }
      });
    }

  /*
<sld:TextSymbolizer>
  <sld:Label><ogc:PropertyName>access</ogc:PropertyName></sld:Label>
  <sld:Font>
    <sld:CssParameter name="font-family">SansSerif</sld:CssParameter>
    <sld:CssParameter name="font-size">12</sld:CssParameter>
    <sld:CssParameter name="font-style">italic</sld:CssParameter>
    <sld:CssParameter name="font-weight">bold</sld:CssParameter>
  </sld:Font>
  <sld:LabelPlacement><sld:LinePlacement/></sld:LabelPlacement>
  <sld:Halo>
    <sld:Radius>1</sld:Radius>
    <sld:Fill>
      <sld:CssParameter name="fill">#FFFFFF</sld:CssParameter>
    </sld:Fill>
  </sld:Halo>
  <sld:Fill>
    <sld:CssParameter name="fill">#204ff5</sld:CssParameter>
  </sld:Fill>

  <sld:VendorOption name="maxDisplacement">40</sld:VendorOption><sld:VendorOption name="autoWrap">40</sld:VendorOption><sld:VendorOption name="spaceAround">0</sld:VendorOption><sld:VendorOption name="followLine">false</sld:VendorOption><sld:VendorOption name="group">yes</sld:VendorOption><sld:VendorOption name="goodnessOfFit">0.2</sld:VendorOption><sld:VendorOption name="conflictResolution">true</sld:VendorOption>
</sld:TextSymbolizer>
  */
    function getLabelObject(rule) {
      var text = rule.getElementsByTagName('sld:TextSymbolizer');
      var new_props = {};

      if (text.length > 0) {
        text = text[0];

        if (nodeExists(text, 'sld:Label')) {
          new_props.attribute = getChildValue(text.getElementsByTagName('sld:Label')[0], 'ogc:PropertyName');
        }

        for (var i = 0, ii = text.childNodes.length; i < ii; i++) {
          var node = text.childNodes[i];
          if (node.tagName === 'sld:Fill') {
            new_props = Object.assign(new_props, sldToJson(node, {
              'fill': 'fillColor'
            }, {}));
          }
        }

        if (nodeExists(text, 'sld:Font')) {
          var font = text.getElementsByTagName('sld:Font')[0];
          new_props = Object.assign(new_props, sldToJson(font, {
            'font-family': 'fontFamily',
            'font-size': 'fontSize',
            'font-style': 'fontStyle',
            'font-weight': 'fontWeight'
          }, {
            'font-size' : parseInt
          }));
        }
      }

      return new_props;
    }

    module.controller('styleEditorController',
        function($scope, stStyleTypes, stStyleChoices, stLayerClassificationService, stStyleRuleBuilder) {
            var styles = {};
            var stStorageService = storytools.edit.styleStorageService.styleStorageService();

            function promptClassChange() {
                // @todo should check for rule edits?
                if ($scope.activeStyle.rules.length > 0) {
                    return window.confirm('delete existing rules?');
                }
                return true;
            }

            function classify() {
                var activeStyle = $scope.activeStyle;
                stLayerClassificationService.classify(
                    $scope.layer,
                    activeStyle.classify.attribute,
                    activeStyle.classify.method,
                    activeStyle.classify.maxClasses).then(function(results) {
                        activeStyle.rules = results;
                        stStyleRuleBuilder.buildRuleStyles(activeStyle);
                });
            }

            function setLayer(layer) {

                $scope.layer = layer;
                $scope.styleTypes = stStyleTypes.getTypes(layer, $scope.layerstyles);
                if ($scope.styleTypes.length > 0) {
                    var activeStyleIndex = getStyleTypeIndex();
                    $scope.styleTypes[activeStyleIndex].active = true;
                    setActiveStyle($scope.styleTypes[activeStyleIndex]);
                }

                var meta = layer.get('metadata');

                if (meta) {
                  if (meta.defaultStyle) {
                    var style_href = meta.defaultStyle.href;
                    if (style_href) {
                      // strip the hostname from style_href
                      style_href = '/geoserver/' + style_href.split('/geoserver/')[1];
                      // this is an exchange assumption, and assumes SLD
                      style_href = style_href.replace('.json', '.sld');

                      fetch(style_href).then(function(r) {
                        r.text().then(function(sldText) {
                          var parser = new DOMParser();
                          var sld_doc = parser.parseFromString(sldText, 'application/xml');

                          var rule = sld_doc.getElementsByTagName('sld:Rule')[0];

                          var prop;
                          var stroke_obj = getStrokeObject(rule);
                          for (prop in stroke_obj) {
                            $scope.activeStyle.stroke[prop] = stroke_obj[prop];
                          }

                          var fill_obj = getFillObject(rule);
                          for (prop in fill_obj) {
                            $scope.activeStyle.symbol[prop] = fill_obj[prop];
                          }

                          var label_obj = getLabelObject(rule);
                          for (prop in label_obj) {
                            $scope.activeStyle.label[prop] = label_obj[prop];
                          }
                        });
                      });
                    }
                  }
                }
            }

            function getStyleTypeIndex() {
              var style = stStorageService.getSavedStyle($scope.layer);
              if (style) {
                for (var i = 0; i < $scope.styleTypes.length; i++) {
                  if (style.typeName === $scope.styleTypes[i].name) {
                    return i;
                  }
                }
              }
              return 0;
            }

            function setActiveStyle(styleType) {
                $scope.currentEditor = styleType;
                $scope.activeStyle = getStyle(styleType);
            }

            function getStyle(styleTyle) {
                var style;
                var savedStyle = stStorageService.getSavedStyle($scope.layer);

                if (styleTyle.name in styles) {
                    style = styles[styleTyle.name];
                } else {
                    var styleType = $scope.styleTypes.filter(function(t) {
                        return t.name == styleTyle.name;
                    });
                    if (styleType.length === 0) {
                        throw 'invalid style type: ' + styleTyle.name;
                    }
                    style = stStyleTypes.createStyle(styleType[0]);
                }

                // apply saved styles to style editor if they exist
                if (goog.isDefAndNotNull(savedStyle) && savedStyle.typeName == style.typeName) {
                  style.symbol = savedStyle.symbol;
                  style.stroke = savedStyle.stroke;
                  style.classify = savedStyle.classify || null;
                  style.rules = savedStyle.rules || null;
                }

                return style;
            }

            // allow the style choices to be modified by a given function.
            $scope.styleChoices = stStyleChoices;
            if ($scope.updateStyleChoices !== undefined) {
              $scope.styleChoices = $scope.updateStyleChoices(stStyleChoices);
            }

            setLayer($scope.layer);

            $scope.setActiveStyle = setActiveStyle;

            $scope.$watch(function() {
                var active = $scope.styleTypes.filter(function(e) {
                    return e.active;
                });
                return active[0];
            }, function(currentSlide, previousSlide) {
                if (currentSlide && (currentSlide !== previousSlide)) {
                    setActiveStyle(currentSlide);
                }
            });

            $scope.$watch('layer',function(neu, old) {
                if (neu != old) {
                    setLayer(neu);
                }
            });

            $scope.$on('featuretype-added', function(event, layer) {
                console.log('FeatureType Added for Layer: ', layer);
                setLayer($scope.layer);
            });

            $scope.changeClassifyProperty = function(prop, value) {
                if (false && !promptClassChange()) {
                    return;
                }
                if (prop) {
                    $scope.activeStyle.classify[prop] = value;
                }
                classify();
            };

            $scope.$watch('activeStyle', function(neu) {
                if ($scope.editorForm.$valid) {
                    var style = $scope.layer.get('style');
                    if (style && style.readOnly === true) {
                        delete style.readOnly;
                        $scope.activeStyle = style;
                    } else {
                        $scope.layer.set('style', $scope.activeStyle);
                    }
                    ($scope.onChange || angular.noop)($scope.layer);
                }
            }, true);

            $scope.$watch('editorForm.$valid', function() {
                ($scope.formChanged || angular.noop)($scope.editorForm);
            });
        });
})();
