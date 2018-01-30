(function() {
    'use strict';

    var module = angular.module('storytools.edit.style.controllers', []);

    function sldToJson(prefix, parentNode, mapping, transforms) {
      var style_obj = {};
      var css_nodes = parentNode.getElementsByTagName(prefix + 'CssParameter');
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

    function getRotation(prefix, rule) {
      var rotation = rule.getElementsByTagName(prefix + 'Rotation')[0];
      return getChildValue(rotation, 'ogc:PropertyName');
    }

    function getFillObject(prefix, rule) {
      if (!nodeExists(rule, prefix + 'Fill')) {
        return {};
      }
      var fill = rule.getElementsByTagName(prefix + 'Fill')[0];
      var new_props = sldToJson(prefix, fill, {
        'fill': 'fillColor',
        'fill-opacity': 'fillOpacity',
      }, {
        'fill-opacity' : function(val) {
          return parseFloat(val) * 100;
        }
      });

      if (nodeExists(rule, prefix + 'Size')) {
        new_props.size = parseInt(getChildValue(rule, prefix + 'Size'));
      }

      if (nodeExists(rule, prefix + 'WellKnownName')) {
        new_props.shape = getChildValue(rule, prefix + 'WellKnownName');
      }

      if (nodeExists(rule, prefix + 'Rotation')) {
        new_props.rotationAttribute = getRotation(prefix, rule);
      }

      return new_props;
    }

    function getStrokeObject(prefix, rule) {
      if (!nodeExists(rule, prefix + 'Stroke')) {
        return {};
      }
      var stroke = rule.getElementsByTagName(prefix + 'Stroke')[0];
      return sldToJson(prefix, stroke, {
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
        },
        'stroke-dasharray' : function(val) {
          if (val === '5.0') {
            return 'dashed';
          } else if (val === '1.0 2.0') {
            return 'dotted';
          }
          return 'solid';
        }
      });
    }

    function getFilterObject(rule) {
      if (!nodeExists(rule, 'ogc:Filter')) {
        return {};
      }

      var filter = rule.getElementsByTagName('ogc:Filter')[0];

      return {
        name: getChildValue(rule, 'sld:Name'),
        property: getChildValue(filter, 'ogc:PropertyName'),
        value: getChildValue(filter, 'ogc:Literal')
      };
    }

    function getLabelObject(prefix, rule) {
      var text = rule.getElementsByTagName(prefix, 'TextSymbolizer');
      var new_props = {};

      if (text.length > 0) {
        text = text[0];

        if (nodeExists(text, prefix + 'Label')) {
          new_props.attribute = getChildValue(text.getElementsByTagName(prefix + 'Label')[0], 'ogc:PropertyName');
        }

        for (var i = 0, ii = text.childNodes.length; i < ii; i++) {
          var node = text.childNodes[i];
          if (node.tagName === prefix + 'Fill') {
            new_props = Object.assign(new_props, sldToJson(prefix, node, {
              'fill': 'fillColor'
            }, {}));
          }
        }

        if (nodeExists(text, prefix + 'Font')) {
          var font = text.getElementsByTagName(prefix + 'Font')[0];
          new_props = Object.assign(new_props, sldToJson(prefix, font, {
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

            /**
             * Get the nearest matching style type based
             * on the match string.
             */
            function getMatchStyleType(matchString) {
              var idx = 0;

              for(var i = 0, ii = $scope.styleTypes.length; i < ii; i++) {
                var name = $scope.styleTypes[i].name;
                if (name.indexOf(matchString) >= 0) {
                  idx = i;

                  $scope.styleTypes[i].active = false;
                }
              }
              return $scope.styleTypes[idx];
            }

            /**
             * This is a light check to see if the styles are
             * more complex than is generally handled by this
             * tool.  This can happen when someone has manually
             * created a geoserver style and then yet another user
             * has opened the styling tool.
             */
            function isStyleComplex(prefix, sld) {
              var count = function(tagName) {
                return sld.getElementsByTagName(prefix + tagName).length;
              };

              // RasterSymbolizer + Transformation are not supported here.
              // And if there are more than 13 rules, it is likely that someone has
              // done some hand-crafted work and the user should be warned.
              return (count('RasterSymbolizer') > 0 || count('Transformation') > 0 || count('Rule') > 13);
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

                          var prefix = '';
                          if (sld_doc.documentElement.tagName.substring(0, 4) === 'sld:') {
                            prefix = 'sld:';
                          }

                          $scope.warning = false;
                          if (isStyleComplex(prefix, sld_doc)) {
                            $scope.warning = 'WARNING! This style is complex and any changes saved here will cause a loss that style to be LOST!';
                          }

                          var rules = sld_doc.getElementsByTagName(prefix + 'Rule');

                          var prop, rule, stroke_obj, fill_obj, label_obj;

                          if (rules.length === 1) {
                            rule = rules[0];

                            stroke_obj = getStrokeObject(prefix, rule);
                            for (prop in stroke_obj) {
                              $scope.activeStyle.stroke[prop] = stroke_obj[prop];
                            }

                            fill_obj = getFillObject(prefix, rule);
                            for (prop in fill_obj) {
                              $scope.activeStyle.symbol[prop] = fill_obj[prop];
                            }

                            label_obj = getLabelObject(prefix, rule);
                            for (prop in label_obj) {
                              $scope.activeStyle.label[prop] = label_obj[prop];
                            }
                          } else if (rules.length > 1) {

                            // the stroke and symbol can be pulled
                            //  from the first rule.
                            rule = rules[0];

                            fill_obj = getFillObject(prefix, rule);
                            for (prop in fill_obj) {
                              $scope.activeStyle.symbol[prop] = fill_obj[prop];
                            }

                            stroke_obj = getStrokeObject(prefix, rule);
                            for (prop in stroke_obj) {
                              $scope.activeStyle.stroke[prop] = stroke_obj[prop];
                            }

                            label_obj = getLabelObject(prefix, rule);
                            for (prop in label_obj) {
                              $scope.activeStyle.label[prop] = label_obj[prop];
                            }

                            // The key attribute can also be pulled from the first
                            //  rule.
                            var filter = getFilterObject(rule);
                            $scope.activeStyle.classify = {
                              attribute: filter.property,
                              method: 'unique',
                              maxClasses: rules.length
                            };

                            var match_style = getMatchStyleType('unique-');
                            match_style.active = true;
                            $scope.activeStyle.typeName = match_style.name;

                            if (fill_obj.fillOpacity) {
                              $scope.activeStyle.classify.opacity = fill_obj.fillOpacity;
                            }

                            var parsed_rules = [];
                            for (var i = 0, ii = rules.length; i < ii; i++) {
                              rule = rules[i];
                              filter = getFilterObject(rule);

                              var parsed_rule = {
                                name: filter.name,
                                value: filter.value,
                                style: {}
                              };

                              if (match_style.name === 'unique-point' || match_style.name === 'unique-polygon') {
                                parsed_rule.style.symbol = getFillObject(prefix, rule);
                                // remove the stroke size
                                delete parsed_rule.style.symbol.size;
                              } else if (match_style.name === 'unique-line') {
                                // bring in the stroke.
                                parsed_rule.style.stroke = getStrokeObject(prefix, rule);
                              }

                              parsed_rules.push(parsed_rule);
                            }

                            $scope.activeStyle.rules = parsed_rules;

                            $scope.layer.set('style', $scope.activeStyle);

                            setActiveStyle(match_style);
                          }
                        });
                      });
                    }
                  }
                }
            }

            function getStyleTypeIndex() {
              var style = $scope.layer.get('style') || stStorageService.getSavedStyle($scope.layer);
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
                var savedStyle = $scope.layer.get('style') || stStorageService.getSavedStyle($scope.layer);

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
