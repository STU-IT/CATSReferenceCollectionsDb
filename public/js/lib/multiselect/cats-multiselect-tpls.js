angular.module('ui.catsmultiselect', [
  'catsmultiselect.tpl.html'
])

  //from bootstrap-ui typeahead parser
  .factory('catsoptionParser', ['$parse', function ($parse) {
    //  ^        start of line
	//  \s*     zero or more whitespace
	//	(.*?)   group of any characters together (the whole string) array 1
	//	(?: starts a non-capturing group - so this won't be captured in the array
	//  (?:\s+as\s+(.*?))?   this ignores " as _label_"	
	//  (?:\s+grouped\s+as\s+\((.*?\s+in\s+.*?)\))  this ignores the grouped by clause
	//  \s+for\s+   matches " for "
	//  (?:([\$\w][\$\w\d]*)) matches the item name
	 
	//                    00000111110
	  
	  var TYPEAHEAD_REGEXP = /^\s*(.*?)(?:\s+as\s+(.*?))?(?:\s+group\s+by\s+(.*?))?\s+for\s+(?:([\$\w][\$\w\d]*))\s+in\s+(.*)$/;
  //  var TYPEAHEAD_REGEXP = /^\s*(.*?)(?:\s+as\s+(.*?))?(?:\s+grouped\s+as\s+\((.*?\s+in\s+.*?)\))?\s+for\s+(?:([\$\w][\$\w\d]*))\s+in\s+(.*)$/;
   // var TYPEAHEAD_GROUP_REGEGXP = /^\s*(?:([\$\w][\$\w\d]*))\s+in\s+(.*)$/;

    return {
    	parse: function (input) {
    		
    		// https://gist.github.com/guillaume86/5638205   
    		// angular-bootstrap-typeahead.js
    		
    		//input is the HTML input element. 'match' 

    		var match = input.match(TYPEAHEAD_REGEXP), modelMapper, viewMapper, source, groupItemName;
    		if (!match) {
    			throw new Error(
    					"Expected typeahead specification in form of '_modelValue_ (as _label_)? (grouped as (_item_ in _group_))? for _item_ in _collection_'" +
    					" but got '" + input + "'.");
    		}

    		return {
    			itemName: match[4],       //the name for the item
    			source: $parse(match[5]), //the source list of objects for the select
    			viewMapper: $parse(match[2] || match[1]),
    			modelMapper: $parse(match[1]),  //the property to use as the label
    			groupItemName: match[3],
    			groupMapper: $parse(match[3])
    		};
    	}
    };
  }])

  .directive('catsmultiselect', ['$parse', '$document', '$compile', '$interpolate', 'catsoptionParser',

    function ($parse, $document, $compile, $interpolate, catsoptionParser) {
      return {
        restrict: 'E',
        require: 'ngModel',
        link: function (originalScope, element, attrs, modelCtrl) {

          var exp = attrs.options,
            parsedResult = catsoptionParser.parse(exp),
            isMultiple = attrs.multiple ? true : false,
            required = false,
            scope = originalScope.$new(),
            changeHandler = attrs.change || angular.noop;

          scope.items = [];
          scope.groups = [];
          scope.header = 'Select';
          scope.multiple = isMultiple;
          scope.disabled = false;

          originalScope.$on('$destroy', function () {
            scope.$destroy();
          });

          var popUpEl = angular.element('<catsmultiselect-popup></catsmultiselect-popup>');

          //required validator
          if (attrs.required || attrs.ngRequired) {
            required = true;
          }
          attrs.$observe('required', function(newVal) {
            required = newVal;
          });

          //watch disabled state
          scope.$watch(function () {
            return $parse(attrs.disabled)(originalScope);
          }, function (newVal) {
            scope.disabled = newVal;
          });

          //watch single/multiple state for dynamically change single to multiple
          scope.$watch(function () {
            return $parse(attrs.multiple)(originalScope);
          }, function (newVal) {
            isMultiple = newVal || false;
          });

          //watch option changes for options that are populated dynamically
          //disabled by CPO
          scope.$watch(function () {
            return parsedResult.source(originalScope);
          }, function (newVal) {
            if (angular.isDefined(newVal))
              parseModel();
          }, true);

          //watch model change
          scope.$watch(function () {
            return modelCtrl.$modelValue;
          }, function (newVal, oldVal) {
            //when directive initialize, newVal usually undefined. Also, if model value already set in the controller
            //for preselected list then we need to mark checked in our scope item. But we don't want to do this every time
            //model changes. We need to do this only if it is done outside directive scope, from controller, for example.
            if (angular.isDefined(newVal)) {
              markChecked(newVal);
              scope.$eval(changeHandler);
            }
            getHeaderText();
            modelCtrl.$setValidity('required', scope.valid());
          }, true);

          function parseModel() {
            scope.items.length = 0;
            scope.groups.length = 0;
            var model = parsedResult.source(originalScope);
            if(!angular.isDefined(model)) return;
            
            for (var i = 0; i < model.length; i++) {
                var local = {};
                local[parsedResult.itemName] = model[i];
            	var grpName = parsedResult.groupMapper(local);
            	
            	if (grpName != undefined){ //deal with others later
	            	var grpIndex = -1;
	            	
	            	//indexOf this group
	            	for(var ix = 0, len = scope.groups.length; ix < len; ix++) {
	            	    if (scope.groups[ix].name === grpName) {
	            	    	grpIndex = ix;
	            	        break;
	            	    }
	            	}
	            	
	            	//create new group
	            	if (grpIndex < 0 ){
	            		var grp = {name: "", items: []};
	            		grp.name = grpName;
	            		grpIndex = scope.groups.push(grp) - 1;
	            		//scope.groups[grpIndex].items = [];
	            	}
	            	//add item
	                scope.groups[grpIndex].items.push({
	                  label: parsedResult.viewMapper(local),
	                  model: model[i],
	                  checked: false,
	                  group: parsedResult.groupMapper(local)
	                });
            	}
            }
            
//            for (var i = 0; i < model.length; i++) {
//              var local = {};
//              local[parsedResult.itemName] = model[i];
//              scope.items.push({
//                label: parsedResult.viewMapper(local),
//                model: model[i],
//                checked: false,
//                group: parsedResult.groupMapper(local),
//              });
              
              

          }

          parseModel();

          element.append($compile(popUpEl)(scope));

          function getHeaderText() {
            if (is_empty(modelCtrl.$modelValue)) return scope.header = attrs.msHeader || 'Select';

              if (isMultiple) {
//                  if (attrs.msSelected) {
                  //    scope.header = $interpolate(attrs.msSelected)(scope);
                	  scope.header = "";
                	  for (i=0; modelCtrl.$modelValue.length > i;i++){
                		  scope.header += modelCtrl.$modelValue[i].name;
                		  if(modelCtrl.$modelValue.length > i + 1) {scope.header += ", "}
                	  }
//                  } else {
//                      scope.header = modelCtrl.$modelValue.length + ' ' + 'selected';
//                  }

            } else {
              var local = {};
              local[parsedResult.itemName] = modelCtrl.$modelValue;
              scope.header = parsedResult.viewMapper(local);
            }
          }

          function is_empty(obj) {
            if (!obj) return true;
            if (obj.length && obj.length > 0) return false;
            for (var prop in obj) if (obj[prop]) return false;
            return true;
          };

          scope.valid = function validModel() {
            if(!required) return true;
            var value = modelCtrl.$modelValue;
            return (angular.isArray(value) && value.length > 0) || (!angular.isArray(value) && value != null);
          };

          function selectSingle(item) {
            if (item.checked) {
              scope.uncheckAll();
            } else {
              scope.uncheckAll();
              item.checked = !item.checked;
            }
            setModelValue(false);
          }

          function selectMultiple(item) {
            item.checked = !item.checked;
            setModelValue(true);
          }

          function setModelValue(isMultiple) {
            var value;

            if (isMultiple) {
              value = [];
              angular.forEach(scope.groups, function (group) {
                angular.forEach(group.items, function (item) {
                    if (item.checked) value.push(item.model);
                })
              })
            } else {
              angular.forEach(scope.groups, function (group) {
                  angular.forEach(group.items, function (item) {
                      if (item.checked) {
                        value = item.model;
                        return false;
                      }
                    })
                })
            }
            modelCtrl.$setViewValue(value);
          }

          function markChecked(newVal) {
            if (!angular.isArray(newVal)) {
              angular.forEach(scope.groups, function (group) {
                  angular.forEach(group.items, function (item) {
                      if (angular.equals(item.model, newVal)) {
                        item.checked = true;
                        return false;
                      }
                  });
              });
            } else {
              angular.forEach(scope.groups, function (group) {
                  angular.forEach(group.items, function (item) {
                      item.checked = false;
                      angular.forEach(newVal, function (i) {
                        if (angular.equals(item.model, i)) {
                          item.checked = true;
                        }
                      });
                  });
              });
            }
          }

          scope.checkAll = function () {
            if (!isMultiple) return;
            angular.forEach(scope.groups, function (group) {
               angular.forEach(group.items, function (item) {
                 item.checked = true;
               });
            });
            setModelValue(true);
          };

          scope.uncheckAll = function () {
            angular.forEach(scope.groups, function (group) {
              angular.forEach(group.items, function (item) {
                item.checked = false;
              });
            });
            setModelValue(true);
          };

          scope.select = function (item) {
            if (isMultiple === false) {
              selectSingle(item);
              scope.toggleSelect();
            } else {
              selectMultiple(item);
            }
          }
        }
      };
    }])

  .directive('catsmultiselectPopup', ['$document', function ($document) {
    return {
      restrict: 'E',
      scope: false,
      replace: true,
      templateUrl: 'catsmultiselect.tpl.html',
      link: function (scope, element, attrs) {

        scope.isVisible = false;

        scope.toggleSelect = function () {
          if (element.hasClass('open')) {
            element.removeClass('open');
            $document.unbind('click', clickHandler);
          } else {
            element.addClass('open');
            $document.bind('click', clickHandler);
            scope.focus();
          }
        };

        function clickHandler(event) {
          if (elementMatchesAnyInArray(event.target, element.find(event.target.tagName)))
            return;
          element.removeClass('open');
          $document.unbind('click', clickHandler);
          scope.$apply();
        }

        scope.focus = function focus(){
          var searchBox = element.find('input')[0];
          searchBox.focus();
        }

        var elementMatchesAnyInArray = function (element, elementArray) {
          for (var i = 0; i < elementArray.length; i++)
            if (element == elementArray[i])
              return true;
          return false;
        }
      }
    }
  }]);

angular.module('catsmultiselect.tpl.html', [])

  .run(['$templateCache', function($templateCache) {
    $templateCache.put('catsmultiselect.tpl.html',

      "<div class=\"btn-group\">\n" +
      "  <button type=\"button\" class=\"btn btn-default dropdown-toggle\" ng-click=\"toggleSelect()\" ng-disabled=\"disabled\" ng-class=\"{'error': !valid()}\">\n" +
      "    {{header}} <span class=\"caret\"></span>\n" +
      "  </button>\n" +
      "  <ul class=\"dropdown-menu\">\n" +
      "    <li>\n" +
      "      <input class=\"form-control input-sm\" type=\"text\" ng-model=\"searchText.label\" autofocus=\"autofocus\" placeholder=\"Filter\" />\n" +
      "    </li>\n" +
      "    <li ng-show=\"multiple\" role=\"presentation\" class=\"\">\n" +
      "      <button class=\"btn btn-link btn-xs\" ng-click=\"checkAll()\" type=\"button\"><i class=\"glyphicon glyphicon-ok\"></i> Check all</button>\n" +
      "      <button class=\"btn btn-link btn-xs\" ng-click=\"uncheckAll()\" type=\"button\"><i class=\"glyphicon glyphicon-remove\"></i> Uncheck all</button>\n" +
      "    </li>\n" +
      "    <ul ng-repeat=\"g in groups\">\n" +
      "        {{g.name}}\n" +      
      "      <li ng-repeat=\"i in g.items | filter:searchText\">\n" +
      "          {{i.name}}\n" +
      "        <a ng-click=\"select(i); focus()\">\n" +
      "          <i class=\"glyphicon\" ng-class=\"{'glyphicon-ok': i.checked, 'empty': !i.checked}\"></i> {{i.label}}</a>\n" +
      "      </li>\n" +
      "    </ul>\n" +
      "  </ul>\n" +
      "</div>");
  }]);
