angular.module("ui.catsmultiselect",["catsmultiselect.tpl.html","ui.bootstrap"]).factory("catsoptionParser",["$parse",function(a){var b=/^\s*(.*?)(?:\s(.*?))?(?:\s+group\s+by\s+(.*?))?\s+for\s+(?:([\$\w][\$\w\d]*))\s+in\s+(.*)$/;return{parse:function(c){var d=c.match(b),e,f,g,h;if(!d){throw new Error("Expected typeahead specification in form of '_modelValue_ (_translation_)? (group by _group_)? for _item_ in _collection_'"+" but got '"+c+"'.")}return{itemName:d[4],grpName:d[3],vocabName:d[5],source:a(d[5]),viewMapper:a(d[1]),modelMapper:a(d[2]),groupMapper:a(d[4]+"."+d[3])}}}}]).factory("vocabService",["$http",function(a){return{updateVocab:function(b,c){return a({url:"vocab/"+b+"/items",method:"POST",data:c,headers:{"Content-Type":"application/json"}})},getVocab:function(b){var c="vocab/"+b;return a.get(c)},loggedin:function(){var b="/loggedin";return a.get(b)}}}]).factory("multistate",[function(){"use strict";var a={};return{multistate:a}}]).directive("catsmultiselect",["$parse","$document","$compile","$interpolate","catsoptionParser","multistate","vocabService",function(a,b,c,d,e,f,g){return{restrict:"E",require:"ngModel",link:function(b,d,f,h){var j=f.options,k=e.parse(j),l=f.multiple?true:false,m=false,n=b.$new(),o=f.change||angular.noop;n.items=[];n.groups=[];n.header="Select";n.multiple=l;n.disabled=false;g.loggedin().success(function(a){n.userRole=a=="0"?false:a.role}).error(function(a){n.userRole=false});b.$on("$destroy",function(){n.$destroy()});var p=angular.element("<catsmultiselect-popup></catsmultiselect-popup>");if(f.required||f.ngRequired){m=true}f.$observe("required",function(a){m=a});n.$watch(function(){return a(f.disabled)(b)},function(a){n.disabled=a});n.$watch(function(){return a(f.multiple)(b)},function(a){l=a||false});n.$watch(function(){return k.source(b)},function(a){if(angular.isDefined(a))q()},true);n.$watch(function(){return h.$modelValue},function(a,b){if(angular.isDefined(a)){w(a);n.$eval(o)}r();h.$setValidity("required",n.valid())},true);function q(){n.items.length=0;n.groups.length=0;var a=k.source(b);n.groups.name=k.vocabName;if(!angular.isDefined(a))return;for(var c=0;c<a.length;c++){var d={};d[k.itemName]=a[c];var e=k.groupMapper(d);if(!e){e="";d[k.itemName][k.grpName]=e}var f=-1;for(var g=0,i=n.groups.length;g<i;g++){if(n.groups[g].name===e){f=g;break}}if(f<0){var j={name:"",items:[]};j.name=e;f=n.groups.push(j)-1}var l=k.viewMapper(d);var m=l;var o=k.modelMapper(d);if(o){m+=" ("+o+")"}var p=false;angular.forEach(h.$modelValue,function(b){if(angular.equals(a[c],b)){p=true}});n.groups[f].items.push({groupName:e,name:l,secondary:o,label:m,model:a[c],checked:p,group:k.groupMapper(d)})}n.groups.sort(function(a,b){return a.name>b.name?1:b.name>a.name?-1:0});for(var q=0;q<n.groups.length;q++){n.groups[q].items.sort(function(a,b){return a.name>b.name?1:b.name>a.name?-1:0})}}q();d.append(c(p)(n));function r(){if(s(h.$modelValue))return n.header=f.msHeader||"Select";if(l){n.header="";for(i=0;h.$modelValue.length>i;i++){n.header+=h.$modelValue[i].name;if(h.$modelValue.length>i+1){n.header+=", "}}}else{var a={};a[k.itemName]=h.$modelValue;n.header=k.viewMapper(a)}}function s(a){if(!a)return true;if(a.length&&a.length>0)return false;for(var b in a)if(a[b])return false;return true}n.valid=function x(){if(!m)return true;var a=h.$modelValue;return angular.isArray(a)&&a.length>0||!angular.isArray(a)&&a!=null&&a!=""};function t(a){if(a.checked){n.uncheckAll()}else{n.uncheckAll();a.checked=!a.checked}v(false)}function u(a){a.checked=!a.checked;v(true)}function v(a){var b;if(a){b=[];angular.forEach(n.groups,function(a){angular.forEach(a.items,function(a){if(a.checked)b.push(a.model)})})}else{angular.forEach(n.groups,function(a){angular.forEach(a.items,function(a){if(a.checked){b=a.model;return false}})})}h.$setViewValue(b)}function w(a){if(!angular.isArray(a)){angular.forEach(n.groups,function(b){angular.forEach(b.items,function(b){if(angular.equals(b.model,a)){b.checked=true;return false}})})}else{angular.forEach(n.groups,function(b){angular.forEach(b.items,function(b){b.checked=false;angular.forEach(a,function(a){if(angular.equals(b.model,a)){b.checked=true}})})})}}n.updateVocabGroup=function(a){var c=k.source;var d=c.assign;d(b,a)};n.checkAll=function(){if(!l)return;angular.forEach(n.groups,function(a){angular.forEach(a.items,function(a){a.checked=true})});v(true)};n.uncheckAll=function(){angular.forEach(n.groups,function(a){angular.forEach(a.items,function(a){a.checked=false})});v(true)};n.select=function(a){if(l===false){t(a);n.toggleSelect()}else{u(a)}}}}}]).directive("catsmultiselectPopup",["$document","$compile","multistate",function(a,b,c){return{restrict:"E",scope:false,replace:true,templateUrl:"catsmultiselect.tpl.html",link:function(b,c,d){b.isVisible=false;b.toggleSelect=function(){if(c.hasClass("open")){c.removeClass("open");a.unbind("click",e)}else{c.addClass("open");a.bind("click",e);b.focus()}};function e(d){if(f(d.target,c.find(d.target.tagName)))return;c.removeClass("open");a.unbind("click",e);b.$apply()}b.focus=function g(){var a=c.find("input")[0];a.focus()};var f=function(a,b){for(var c=0;c<b.length;c++)if(a==b[c])return true;return false}}}}]).controller("ModalVocabCtrl",["$scope","$modal","multistate",function(a,b,c){a.items=["item1","item2","item3"];a.addItem=function(){var c=b.open({size:"lg",templateUrl:"catsvocab.tpl.html",controller:ModalVocabInstanceCtrl,resolve:{groups:function(){return a.$parent.groups},pnt:function(){return a.$parent}}})};a.showEditButton=function(){if(a.$parent.userRole=="admin"){return true}else{if(a.groups.name=="colours"||a.groups.name=="pigments"||a.groups.name=="binders"||a.groups.name=="dyes"||a.groups.name=="materials"){return true}else{return false}}}}]);var ModalVocabInstanceCtrl=["$scope","$modalInstance","$timeout","groups","vocabService","pnt",function(a,b,c,d,e,f){a.vocab={};a.groups=d;a.loading=false;a.alerts=[];a.ok=function(){b.close()};a.cancel=function(){b.dismiss("cancel")};var g=function(b){a.alerts.push({type:"success",msg:b,icon:"glyphicon glyphicon-ok"});c(function(){a.alerts.splice(0,1);a.vocab={}},3e3)};var h=function(b){a.loading=false;a.alerts.push({type:"danger",msg:b,icon:"glyphicon glyphicon-warning-sign"});c(function(){a.alerts.splice(0,1)},3e3)};a.closeAlert=function(b){a.alerts.splice(b,1)};a.update=function(b){var c={item:{name:a.vocab.name,secondaryname:a.vocab.secName,grp:a.vocab.grpName}};a.loading=true;e.updateVocab(b,c).success(function(c){e.getVocab(b).success(function(b){var c=b[0].items.sort(function(a,b){return a.name>b.name?1:b.name>a.name?-1:0});f.updateVocabGroup(c);g("Vocabulary updated successfully");a.loading=false}).error(function(a){h("Reading vocabs failed!")})}).error(function(a){h("Updating vocabs failed!")})};a.updateInputs=function(b){for(var c=0;c<a.groups.length;c++){for(var d=0;d<a.groups[c].items.length;d++){if(a.groups[c].items[d].name==b){a.vocab.secName=a.groups[c].items[d].secondary;a.vocab.grpName=a.groups[c].name;return}}}a.vocab.secName="";a.vocab.grpName="";return}}];angular.module("catsmultiselect.tpl.html",[]).run(["$templateCache",function(a){a.put("catsmultiselect.tpl.html",'<div class="btn-group">\n'+'  <button type="button" class="btn btn-default dropdown-toggle" ng-click="toggleSelect()" ng-disabled="disabled" ng-class="{\'has-error\': !valid()}">\n'+"    {{header}} \n"+"  </button>\n"+'  <ul class="dropdown-menu">\n'+'  <div class="row uigroup">'+'    <div ng-show="multiple" role="presentation" class="col col-sm-8">\n'+'      <button class="btn btn-link btn-xs" ng-click="checkAll()" type="button"><i class="glyphicon glyphicon-ok"></i> Check all</button>\n'+'      <button class="btn btn-link btn-xs" ng-click="uncheckAll()" type="button"><i class="glyphicon glyphicon-remove"></i> Uncheck all</button>\n'+"    </div>"+"  </div>"+'  <div class="row uigroup">'+'    <div class="col col-sm-8">\n'+'      <input class="form-control" type="text" ng-model="searchText.$" autofocus="autofocus" placeholder="Filter" />\n'+"    </div>"+'<div ng-controller="ModalVocabCtrl">\n'+'    <div class="col col-sm-4">\n'+'       <button class="btn btn-default" ng-show="showEditButton()" ng-click="addItem()" type="button"><i class="glyphicon glyphicon-edit"></i> Edit list </button>\n'+"    </div>\n"+"    </div>"+"  </div>"+'  <div class="row uigroup">'+'    <div class="col col-sm-1">\n'+"    </div>"+'    <div class="col col-sm-10">\n'+'    <ul ng-repeat="g in groups | filter:searchText">\n'+'       <label ng-show="g.name != false">'+"        {{g.name}}\n"+"       </label>"+'      <li ng-repeat="i in g.items | filter:searchText">\n'+'       <label style="font-weight: normal">'+'        <input type="checkbox" ng-disabled="empty" ng-checked="i.checked" ng-click="select(i)	"/>'+"        <span> {{i.label}}</span>\n"+"       </label>"+"      </li>\n"+"    </ul>\n"+"    </div>"+"  </div>"+"  </ul>\n"+"</div>")}]).run(["$templateCache",function(a){a.put("catsvocab.tpl.html","<div ng-include=\"'catsvocab.tpl.html'\">\n"+'    <script type="text/ng-template" id="catsvocab.tpl.html">\n'+'        <div class="modal-header">\n'+'            <h3 class="modal-title">Vocabulary Editor</h3>\n'+"        </div>\n"+'        <div class="modal-body">\n'+'          <table class="table">\n'+"            <h4> {{ groups.name }} </h4>\n"+"            <thead>\n"+"               <th> Preferred name </th>\n"+"               <th> Secondary name(s) </th>\n"+"               <th> Group </th>\n"+"               <th></th>\n"+"            </thead>\n"+"            <tbody>\n"+"              <tr>\n"+'                <td><input type="text" ng-model="vocab.name" ng-change="updateInputs(vocab.name)" class="form-control"></input></td>'+'                <td><input type="text" ng-model="vocab.secName" class="form-control"></input></td>'+'                <td><input type="text" ng-model="vocab.grpName" class="form-control"></input></td>'+'                <td><button class="btn btn-primary" ng-disabled="!vocab.name" ng-click="update(groups.name)" ><i class="glyphicon glyphicon-save"></i> Save</button></td>'+"              </tr>\n"+"            </tbody>\n"+'            <tbody ng-repeat="group in groups | orderBy:items.name ">\n'+'              <tr ng-repeat="item in group.items | filter:vocab.name  ">\n'+"                <td> {{ item.name }} </td>"+"                <td> {{ item.secondary }} </td>"+"                <td> {{ group.name }} </td>"+'                <td><i class="glyphicon glyphicon-ok" ng-show="vocab.name == item.name"></i> </td>'+"              </tr>\n"+"            </tbody>\n"+"          </table>\n"+'          <alert ng-repeat="alert in alerts" type="{{alert.type}}" close="closeAlert($index)" class="animation"><i class="{{alert.icon}}"></i> {{alert.msg}}</alert>'+"        </div>\n"+'        <div class="modal-footer">\n'+'         <img class="spinner" ng-show="loading" src="images/ajax-loader.gif "></img>'+'            <button class="btn btn-primary" ng-click="ok()">Close</button>\n'+"        </div>\n"+"    </script>\n"+"</div>\n")}]);angular.module("ui.catsartistselect",["catsartistselect.tpl.html"]).factory("apiService",["$http",function(a){return{getCorpusArtworkById:function(b){var c="searchsmk?id="+b;return a.get(c)},getCatsArtworkById:function(b){var c="artwork?invNum="+b;return a.get(c)}}}]).directive("catsartistselect",["$http","$parse","$document","$compile","$interpolate","apiService","$timeout",function(a,b,c,d,e,f,g){return{restrict:"E",require:"ngModel",link:function(a,c,e,h){var j=e.options,k=false,l=a.$new(),m=e.change||angular.noop;l.items=[];l.groups=[];l.disabled=false;l.loading=false;l.showSMKSearch=false;var n=l.$eval(e.ngModel);if(n&&n.inventoryNum){l.searchText=n.inventoryNum}a.$on("$destroy",function(){l.$destroy()});var o=angular.element("<catsartistselect-popup></catsartistselect-popup>");if(e.required||e.ngRequired){k=true}e.$observe("required",function(a){k=a});l.$watch(function(){return b(e.disabled)(a)},function(a){l.disabled=a});c.append(d(o)(l));function p(a){if(!a)return true;if(a.length&&a.length>0)return false;for(var b in a)if(a[b])return false;return true}l.valid=function q(){if(!k)return true;var a=h.$modelValue;return angular.isArray(a)&&a.length>0||!angular.isArray(a)&&a!=null};l.select=function(a){var b;if(!a.checked){a.checked=!a.checked}angular.forEach(l.groups,function(a){angular.forEach(a.items,function(a){if(a.checked){b=a.model;return false}})});h.$setViewValue(b);l.toggleSelect()};l.cancel=function(a){l.cancelled=true;l.toggleSelect()};getSMK=function(a){f.getCorpusArtworkById(a).success(function(a){l.loading=false;l.resultText="";var b={};var c=a.response;if(c.numFound===1){var d=c.docs[0];b.corpusId=d.csid;b.externalurl=d.externalurl;b.inventoryNum=d.id_s;b.title=d.title_first;var e=new Date(d.object_production_date_earliest);b.productionDateEarliest=d.object_production_date_earliest?d.object_production_date_earliest.substring(0,10):"";b.productionDateLatest=d.object_production_date_latest?d.object_production_date_latest.substring(0,10):"";b.artist=d.artists_data.replace(/;-;/g,", ");b.dimensions=d.dimension_netto;b.nationality=d.artists_natio.replace(/;-;/g,", ");b.technique=d.prod_technique;b.owner=d.owner}else if(c.numFound===0){l.resultText="No SMK records found"}else{l.resultText="More than one SMK record found. Not good."}if(b&&b.inventoryNum){l.groups[l.groups.length]={name:"Results from Corpus",items:[{label:b.inventoryNum+" "+b.title,model:b}]}}}).error(function(a){l.loading=false;l.resultText="The SMK server is unavailable"})};l.searchSmk=function(a){l.loading=true;l.groups=[];l.resultText="Searching SMK...";g(function(){getSMK(a)},1e3)};getCats=function(a){f.getCatsArtworkById(a).success(function(a){l.loading=false;var b=a;if(b){l.groups=[{name:"Results from CATS",items:[]}];for(i=0;i<b.length;i++){var c=b[i];l.groups[0].items[i]={label:c.inventoryNum+" "+c.title,model:c}}if(b.length===0){l.resultText="No records found";l.showSMKSearch=true}else{l.resultText=""}}}).error(function(a){l.loading=false;l.resultText="Failed to connect to CATS database"})};l.searchCats=function(a){l.toggleSelect();l.loading=true;l.groups=[];l.resultText="Searching CATS...";g(function(){getCats(a)},1e3)};l.change=function(){var a={};a.inventoryNum=l.searchText;h.$setViewValue(a);l.closeSelect();l.showSMKSearch=false}}}}]).directive("catsartistselectPopup",["$document",function(a){return{restrict:"E",scope:false,replace:true,templateUrl:"catsartistselect.tpl.html",link:function(b,c,d){b.isVisible=false;b.toggleSelect=function(){if(c.hasClass("open")){c.removeClass("open");a.unbind("click",e)}else{c.addClass("open");a.bind("click",e);b.focus()}};b.closeSelect=function(){if(c.hasClass("open")){c.removeClass("open");a.unbind("click",e)}};function e(d){if(f(d.target,c.find(d.target.tagName)))return;c.removeClass("open");a.unbind("click",e);b.$apply()}b.focus=function g(){var a=c.find("input")[0];a.focus()};var f=function(a,b){for(var c=0;c<b.length;c++)if(a==b[c])return true;return false}}}}]);angular.module("catsartistselect.tpl.html",[]).run(["$templateCache",function(a){a.put("catsartistselect.tpl.html",'<div class="btn-group">\n'+'  <div class="input-group">'+'  <input class="searchInput form-control" ng-change="change()" ng-model="searchText" type="text" placeholder="Inventory number">\n'+'  <span class="input-group-btn">'+'    <button type="button" class="btn btn-default" ng-click="searchCats(searchText)" ng-disabled="disabled" ng-class="{\'error\': !valid()}">\n'+'      <i class="glyphicon glyphicon-search"></i>\n'+"    </button>\n"+"  </span>"+"  </div>"+'  <ul class="dropdown-menu">\n'+'  <div class="row uigroup">'+"  </div>"+'  <div class="row uigroup">'+'    <div class="col col-sm-1">\n'+"    </div>"+'    <div class="col col-sm-10">\n'+'    <ul ng-repeat="g in groups | filter:searchText">\n'+'       <label ng-show="g.name != false">'+"        {{g.name}}\n"+"       </label>"+'      <li ng-repeat="i in g.items | filter:searchText">\n'+'       <label style="font-weight: normal">'+'        <input type="checkbox" ng-disabled="empty" ng-checked="i.checked" ng-click="select(i)	"/>'+"        <span> {{i.label}}</span>\n"+"       </label>"+"      </li>\n"+"    </ul>\n"+"    </div>"+"  </div>"+'  <div ng-show="resultText" class="row uigroup">'+'        <div class="col col-sm-1"></div>'+'        <div class="col col-sm-10">\n'+'          <label style="font-weight: normal">'+"            {{resultText}}\n"+"          </label>"+"        </div>"+"   </div>"+'  <div class="row uigroup">'+'    <div class="col col-sm-12">\n'+'      <div class="modal-footer">'+'         <img class="spinner" ng-show="loading" src="images/ajax-loader.gif "></img>'+'         <button class="btn btn-primary" ng-show="showSMKSearch" ng-click="searchSmk(searchText)" type="button"><i class="glyphicon glyphicon-search"></i> Search SMK </button>\n'+'         <button class="btn btn-warning" ng-click="cancel()" type="button"><i class="glyphicon glyphicon-ban-circle"></i> Cancel </button>\n'+"      </div>"+"   </div>"+"  </div>"+"  </ul>\n"+"</div>")}]);"use strict";angular.module("myApp",["myApp.controllers","myApp.filters","myApp.services","myApp.directives","ngRoute","ngAnimate","ui.multiselect","ui.catsmultiselect","ui.catsartistselect","toggle-switch"]).config(function(a,b){a.when("/browse",{templateUrl:"partials/browse",controller:"BrowseController"}).when("/view",{templateUrl:"partials/view",controller:"ViewController"}).when("/search",{templateUrl:"partials/search",controller:"SearchController"}).otherwise({redirectTo:"/browse"});b.html5Mode(true)});"use strict";var serviceMod=angular.module("myApp.services",[]).value("version","0.1");serviceMod.factory("catsAPIservice",["$http",function(a){return{search:function(b,c){var d="sample?pageSize=100"+(!!b?"&fulltext="+b:"");if(c&&c.isOpen){d+=(!!c.sampleType?"&sampletype="+c.sampleType.name:"")+(!!c.earliestDate?"&startdate="+c.earliestDate:"")+(!!c.latestDate?"&enddate="+c.latestDate:"")}return a({url:d,method:"GET",headers:{Accept:"application/json"}})},searchSize:function(b,c){var d="sample?count=true"+(!!b?"&fulltext="+b:"");if(c&&c.isOpen){d+=(!!c.sampleType?"&sampletype="+c.sampleType.name:"")+(!!c.earliestDate?"&startdate="+c.earliestDate:"")+(!!c.latestDate?"&enddate="+c.latestDate:"")}return a.get(d)},createSample:function(b){return a({url:"sample",method:"POST",data:b,headers:{"Content-Type":"application/json"}})},"delete":function(b){return a({url:"sample/"+b,method:"DELETE"})},createArtwork:function(b){return a({url:"artwork",method:"POST",data:b,headers:{"Content-Type":"application/json"}})},readArtwork:function(b){var c="artwork/"+b;return a.get(c)},getVocab:function(b){var c="vocab";if(b!=undefined){c+="/"+b}return a.get(c)},Excel:function(b,c){var d="sample?fulltext="+(!!b?b:"");if(c&&c.isOpen){d+=(!!c.sampleType?"&sampletype="+c.sampleType.name:"")+(!!c.earliestDate?"&startdate="+c.earliestDate:"")+(!!c.latestDate?"&enddate="+c.latestDate:"")}return a({url:d,method:"GET",responseType:"arraybuffer",headers:{Accept:"application/vnd.openxmlformats"}})},login:function(b,c){return a({url:"/login?username="+b+"&password="+c,method:"POST"})},logout:function(){return a({url:"/logout",method:"POST"})},loggedin:function(){var b="/loggedin";return a.get(b)},updateUser:function(b){return a({url:"user",method:"POST",data:b,headers:{"Content-Type":"application/json"}})}}}]);serviceMod.factory("state",[function(){"use strict";var a={};return{state:a}}]);"use strict";angular.module("myApp.controllers",["ui.bootstrap","angularFileUpload"]).controller("AppCtrl",["$scope","$http","state","$location","$modal","catsAPIservice",function(a,b,c,d,e,f){c.filter={};c.uploadedImage={};c.deleteImage={index:""};f.getVocab("sampleTypes").success(function(a){if(a&&a[0]&&a[0]._id){c.sampleTypes=a[0].items}}).error(function(a){alert("Sample Types could not be read from database. Filter is not initialized")});f.loggedin().success(function(b){c.loggedin=b=="0"?false:true;a.email=b=="0"?false:b.username;c.email=a.email;a.loggedin=c.loggedin}).error(function(a){c.loggedin=false});a.$watch(function(){return c.loggedin},function(b,d){if(b!==d){a.email=c.email;a.loggedin=c.loggedin}});a.loginUser=function(){var a=e.open({size:"sm",templateUrl:"myLoginContent",controller:loginModalInstanceCtrl})};a.logout=function(){f.logout().success(function(b){c.loggedin=false;a.loggedin=c.loggedin}).error(function(a){errorAlert(a)})};a.searchClicked=function(a){d.path("/search");c.searchTerm=a;c.searchRequested=true}}]).controller("SearchController",["$q","$scope","catsAPIservice","state","$modal","$log","$location",function(a,b,c,d,e,f,g){b.loggedin=d.loggedin;b.sampleTypes=d.sampleTypes;b.searchResultsList=d.resultList;b.searchResultsListSize=d.resultListSize;b.searchTerm=d.searchTerm;b.filter=d.filter;b.switchStatus=d.filter.isOpen;b.search=function(){c.search(d.searchTerm,b.filter).success(function(a){b.searchTerm=d.searchTerm;b.searchResultsList=a;d.resultList=a;b.searchCount()})};b.searchCount=function(){c.searchSize(d.searchTerm,b.filter).success(function(a){b.searchResultsListSize=a;d.resultListSize=a}).error(function(a){b.searchResultsListSize=0})};b.$watch(function(){return b.filter},function(a,c){if(a!==c){d.filter=b.filter}},true);b.filterChanged=function(a){d.searchRequested=true};b.$watch(function(){return d.loggedin},function(a,c){if(a!==c){b.loggedin=d.loggedin}});b.viewSample=function(a){g.path("/view");d.sample=d.resultList[a];d.itemIndex=a;d.create=false};b.$watch(function(){return d.searchRequested},function(a,c){if(a===true){b.search();d.searchRequested=false}});b.registerClicked=function(a){d.registerRequested=true;d.sample={};if(a){d.sample=a}};b.deleteClicked=function(a){c.delete(a).success(function(a){d.searchRequested=true;alert("Record deleted")})};var h=function(a){if(document.createEvent){var b=document.createEvent("MouseEvents");b.initMouseEvent("click",true,true,window,0,0,0,0,0,false,false,false,false,0,null);a.dispatchEvent(b)}};var i=function(a,b){var d=null;var e="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";c.Excel(a,b).success(function(a){try{d=new Blob([a],{type:e})}catch(b){window.BlobBuilder=window.BlobBuilder||window.WebKitBlobBuilder||window.MozBlobBuilder||window.MSBlobBuilder;if(b.name=="TypeError"&&window.BlobBuilder){var c=new BlobBuilder;c.append(a);d=c.getBlob(e)}else if(b.name=="InvalidStateError"){d=new Blob([a],{type:e})}else{alert("Your browser doesn't support this. "+"Please try again with a more recent browser.")}}try{var f=URL.createObjectURL(d)}catch(b){if(b.type=="not_defined"&&b.arguments[0]==="URL"){var f=webkitURL.createObjectURL(d)}}var g=document.createElement("a");g.setAttribute("href",f);g.setAttribute("download","cats_export.xlxs");h(g)})};b.exportClicked=function(a,b){i(a,b)}}]).controller("BrowseController",["$scope",function(a){}]).controller("ViewController",["$scope","state","catsAPIservice","$location",function(a,b,c,d){a.itemIndex=b.itemIndex;a.numResults=b.resultList.length;a.record=b.resultList[a.itemIndex];a.statusMeta={isSampleOpen:true,isArtworkOpen:true,isAnalysisOpen:true,isFirstDisabled:false};a.nextItem=function(){a.itemIndex=a.itemIndex+1;a.itemIndex=a.itemIndex%b.resultList.length;a.record=b.resultList[a.itemIndex];b.itemIndex=a.itemIndex};a.previousItem=function(){a.itemIndex=a.itemIndex-1;a.itemIndex=a.itemIndex<0?b.resultList.length-1:a.itemIndex;a.record=b.resultList[a.itemIndex];b.itemIndex=a.itemIndex};a.backToSearch=function(){d.path("/search")}}]).controller("DatepickerCntrl",["$scope",function(a){a.open=function(b){b.preventDefault();b.stopPropagation();a.opened=true};a.dateOptions={formatYear:"yy",startingDay:1,datepickerMode:"day"};a.initDate=new Date("1970-01-01T01:00:00.000Z");a.formats=["dd/MM/yyyy"];a.format=a.formats[0]}]).controller("RegisterCtrl",["$scope","$modal","$log","state","catsAPIservice",function(a,b,c,d,e){a.open=function(d){var f=b.open({templateUrl:"myModalContent",controller:ModalInstanceCtrl,size:d,backdrop:"static",resolve:{vocabsArray:function(){return e.getVocab().then(function(a){if(a&&a.data&&a.data[0]){return a.data}})}}});f.result.then(function(b){a.selected=b},function(){c.info("Modal dismissed at: "+new Date)})};a.$watch(function(){return d.registerRequested},function(b,c){if(b===true){a.open("lg");d.registerRequested=false}})}]).controller("ImageUploadController",["$scope","$upload","$timeout","state",function(a,b,c,d){a.alerts=[];a.fileReaderSupported=window.FileReader!=null&&(window.FileAPI==null||FileAPI.html5!=false);a.uploadRightAway=false;a.getThumbnail=function(a){return a.replace("http://cspic.smk.dk/","http://cspic.smk.dk/?pic=")+"&mode=width&width=200"};a.deleteImage=function(a){d.deleteImage={index:a}};a.hasUploader=function(b){return a.upload[b]!=null};a.cancel=function(b){if(a.hasUploader(b)){a.upload[b].abort();a.upload[b]=null}};a.onFileSelect=function(g){a.selectedFiles=[];a.progress=[];if(a.upload&&a.upload.length>0){for(var h=0;h<a.upload.length;h++){if(a.upload[h]!=null){a.upload[h].abort()}}}a.upload=[];a.uploadResult=[];a.selectedFiles=g;a.dataUrls=[];for(var h=0;h<g.length;h++){var i=g[h];if(a.fileReaderSupported&&i.type.indexOf("image")>-1){var j=new FileReader;j.readAsDataURL(g[h]);var k=function(b,d){b.onload=function(b){c(function(){a.dataUrls[d]=b.target.result})}}(j,h)}a.progress[h]=-1;if(a.uploadRightAway){a.start(h)}}a.start=function(c){a.progress[c]=0;a.errorMsg=null;a.upload[c]=b.upload({url:"image",method:"POST",data:{myObj:a.myModelObj},file:a.selectedFiles[c]});a.upload[c].then(function(b){a.uploadResult.push(b.statusText);var c={};c.name=a.selectedFiles[0].name;c.url=b.data;d.uploadedImage=c;e("Image successfully uploaded")},function(a){if(a.status>0){if(a.status==409){f(" An image with this name already exists. Please rename the image and try again.")}else{f(" The image could not be saved")}}},function(b){a.progress[c]=Math.min(100,parseInt(100*b.loaded/b.total))})}};var e=function(b){a.alerts.push({type:"success",msg:b,icon:"glyphicon glyphicon-ok"});c(function(){a.alerts.splice(0,1);c(function(){},1e3)},3e3)};var f=function(b){a.alerts.push({type:"danger",msg:b,icon:"glyphicon glyphicon-warning-sign"});c(function(){a.alerts.splice(0,1)},3e3)}}]);var loginModalInstanceCtrl=["$scope","$modalInstance","state","$timeout","catsAPIservice",function(a,b,c,d,e){a.alerts=[];a.login=function(b,d,h,i,j,k){a.submitted=true;if(b.$invalid){g("Missing email or password");return}if(k){if(!i||!j||i!=j){g("Both new passwords must be the same");return}}e.login(d,h).success(function(a){c.email=a.username;c.loggedin=true;if(k){var b={username:d,password:i,role:a.role};e.updateUser(b).success(function(a){f("Password Changed")}).error(function(a){g("Password not changed")})}f("Login succeeded")}).error(function(a){g("Wrong user or password")})};var f=function(c){a.alerts.push({type:"success",msg:c,icon:"glyphicon glyphicon-ok"});d(function(){a.alerts.splice(0,1);b.close()},3e3)};var g=function(b){a.alerts.push({type:"danger",msg:b,icon:"glyphicon glyphicon-warning-sign"});d(function(){a.alerts.splice(0,1)},3e3)};a.closeAlert=function(b){a.alerts.splice(b,1)}}];var ModalInstanceCtrl=["$timeout","$scope","$modalInstance","catsAPIservice","state","vocabsArray",function(a,b,c,d,e,f){b.artwork={};b.mainTabs={tabOneState:true};b.submitted=false;b.alerts=[];b.createAnother=false;var g=function(){b.record={};b.record.paintLayer=[{id:"1",layerType:"",paintBinder:[],colour:"",pigment:"",dye:"",active:true}];b.record.sampleAnalysis=[{id:"1",type:"",description:"",referenceNumber:"",date:"",employee:"",owner:"",originLocation:"",location:"",results:"",active:true}];b.record.images=[]};b.$watch(function(){return e.uploadedImage},function(a,c){if(a!==c){b.record.images.push(e.uploadedImage)}});b.$watch(function(){return e.deleteImage},function(a,c){if(a!==c){b.record.images.splice(e.deleteImage.index,1)}});if(e.sample&&e.sample._id){b.record=e.sample}else{g()}for(var h=0;h<f.length;h++){b[f[h].type]=f[h].items}var i=function(){angular.forEach(b.record.paintLayer,function(a){a.active=false})};var j=function(){var a=b.record.paintLayer.length+1;var c={id:a,layerType:"",paintBinderbinder:[],colour:"",pigment:"",dye:"",active:true};b.record.paintLayer.push(c)};b.addLayer=function(){i();j()};b.removeLayerTab=function(a){b.record.paintLayer.splice(a,1)};var k=function(){angular.forEach(b.record.xrayGroup,function(a){a.active=false})};var l=function(){var a=b.record.xrayGroup.length+1;var c={id:a,kv:"",ma:"",time:"",focus:"",distance:"",filter:"",test:false,active:true};b.record.xrayGroup.push(c)};b.addXray=function(){k();l()};b.removeXrayTab=function(a){b.record.xrayGroup.splice(a,1)};var m=function(){angular.forEach(b.record.sampleAnalysis,function(a){a.active=false})};var n=function(){var a=b.record.sampleAnalysis.length+1;var c={id:a,sampleAnalysisType:"",sampleAnalysisDescription:"",active:true};b.record.sampleAnalysis.push(c)};b.addAnalysis=function(){m();n()};b.removeAnalysisTab=function(a){b.record.sampleAnalysis.splice(a,1)};b.clearArtwork=function(){b.record.artwork={}};b.addArtwork=function(a){d.createArtwork(a).success(function(a){alert("Artwork saved")}).error(function(a){alert(a)})};var o=function(){b.alerts.push({type:"danger",msg:"Save failed. Please correct the highlighted "+"fields and try again.",icon:"glyphicon glyphicon-warning-sign"});a(function(){b.alerts.splice(0,1)},5e3)};var p=function(c){b.alerts.push({type:"danger",msg:c,icon:"glyphicon glyphicon-warning-sign"});a(function(){b.alerts.splice(0,1)},5e3)};var q=function(d){b.alerts.push({type:"success",msg:d,icon:"glyphicon glyphicon-ok"});a(function(){b.alerts.splice(0,1);if(b.createAnother===false){c.close()}else{b.submitted=false;g()}},3e3)};b.closeAlert=function(a){b.alerts.splice(a,1)};var r=function(a){var b=JSON.parse(JSON.stringify(a));d.createSample(b).success(function(a){q("Record saved")}).error(function(a){var b="Save Sample failed ";b+=a?"("+a+")":"";p(b)});e.searchRequested=true};var s=function(){d.createArtwork(b.record.artwork).success(function(a){b.record.artwork._id=a._id;r(b.record)}).error(function(a){var b="Save Artwork & Sample failed ";b+=a?"("+a+")":"";p(b)})};b.register=function(a){b.submitted=true;if(a){o();b.mainTabs.tabOneState=true;return}if(b.record.artwork&&!b.record.artwork._id){s()}else{r(b.record)}};b.ok=function(){c.close();e.searchRequested=true};b.cancel=function(){c.dismiss("cancel");e.searchRequested=true}}];var CarouselImageCtrl=["$scope","state",function(a,b){a.showImages=false;a.myInterval=-1;var c=a.slides=[];a.$watch(function(){return b.itemIndex},function(a,b){if(a!==b){d(a)}});a.addArtworkSlide=function(a,b,d){var e=b.replace("http://cspic.smk.dk/","http://cspic.smk.dk/?pic=")+"&mode=width&width=600";c.push({title:a,image:e,text:d})};var d=function(d){c=a.slides=[];var e=b.resultList[d];if(e&&e.artwork&&e.artwork.externalurl){a.addArtworkSlide(e.artwork.inventoryNum,e.artwork.externalurl,e.artwork.title)}if(e&&e.images){angular.forEach(e.images,function(a){var b=a.url.replace("http://cspic.smk.dk/","http://cspic.smk.dk/?pic=")+"&mode=width&width=600";c.push({title:a.name,image:b,text:a.description})})}if(c.length>0){a.showImages=true}};d(b.itemIndex)}];var ImageUploadCtrl=["$scope",function(a){a.data="none";a.add=function(){var b=document.getElementById("file").files[0],c=new FileReader;c.onloadend=function(b){a.data=b.target.result};c.readAsBinaryString(b)}}];"use strict";angular.module("myApp.filters",[]).filter("interpolate",["version",function(a){return function(b){return String(b).replace(/\%VERSION\%/gm,a)}}]);"use strict";angular.module("myApp.directives",[]).directive("appVersion",["version",function(a){return function(b,c,d){c.text(a)}}]).directive("disableAnimation",["$animate",function(a){return{restrict:"A",link:function(b,c,d){d.$observe("disableAnimation",function(b){a.enabled(!b,c)})}}}]).directive("datepickerLocaldate",["$parse",function(a){var b={restrict:"A",require:["ngModel"],link:c};return b;function c(a,b,c,d){var e=d[0];
e.$parsers.push(function(a){if(!a){return null}a.setMinutes(a.getMinutes()-a.getTimezoneOffset());return a.toISOString().substring(0,10)});e.$formatters.push(function(a){if(!a){return undefined}var b=new Date(a);b.setMinutes(b.getMinutes()+b.getTimezoneOffset());return b})}}]);