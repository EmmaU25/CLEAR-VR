class Automate{
  constructor(ets,trans){
    this.nodes = ets;
    this.links = trans;
  }
}

class etatBack{
  constructor(id,x,y,z,txt){
    this.id = id;
    this.x = x;
    this.y = y;
    this.z = z;
    this.txt = txt;
  }
}

class Etat {
  constructor(id,color,counter){
    this.id = id;
    this.color = color;
    this.counter = counter;
  }
}

class Transition {
  constructor(des,txt, color,next,curve){
    this.source = des;
    this.name = txt;
    this.group  = color;
    this.target = next;
    this.curvature = curve; 
  }
}

myapp.controller("controllerAutomate",function($scope){
  $scope.backs = [],$scope.ets = [], $scope.trans = [], $scope.gData = {}, $scope.freeMode = false, $scope.isDisabled = true, $scope.doIt = false, $scope.btns = false, $scope.counter = false, $scope.sinkState = false;

  $scope.parseContent = function($fileContent){   
    if($scope.isDisabled){
      $scope.parserCont($fileContent);
      $scope.btns = true;
      $scope.nameFile = document.getElementById('graphAutomate').files[0].name;
    }else {
      $scope.parseContre($fileContent);
      $scope.draw();
      $scope.doIt = true;
      $scope.counter = true;
    }
  };

  $scope.yes = function(){
    $scope.isDisabled = false;
  };
  
  $scope.not = function(){
    $scope.draw();
    $scope.doIt = true;
  };

  $scope.clean = function(){
    location.reload();
  };



  $scope.camera = function(){
    const distRatio = 1 + 95/Math.hypot($scope.backs[$scope.backs.length - 1].x, $scope.backs[$scope.backs.length - 1].y, $scope.backs[$scope.backs.length - 1].z);
    Graph.cameraPosition({x: $scope.backs[$scope.backs.length - 1].x * distRatio , y: $scope.backs[$scope.backs.length - 1].y * distRatio ,z: $scope.backs[$scope.backs.length - 1].z * distRatio},$scope.backs[$scope.backs.length - 1],3000);
  }

  $scope.parseContre = function(cont){
    var src, tar;
    var lines = cont.split("\n");
    for (var i = 1; i < lines.length; i++) {
      if(lines[i].length > 1){
        var currentline = lines[i].split("\n");
        currentline = lines[i].replace(/[\(\)]/g, '');
        currentline = currentline.split(",",3);
        src = parseInt(currentline[0]);
        tar = parseInt(currentline[2]);
        $scope.searchEtatsCounter(src);
        $scope.searchEtatsCounter(tar);
        for (var z = 0; z < $scope.trans.length; z++) {
          if($scope.trans[z].source === src && $scope.trans[z].target === tar){
            $scope.trans[z].group = "#FFFF00";
          }
        }
      }
    }
  };

  $scope.searchEtatsCounter = function(ets){
    for (var i = 0; i < $scope.ets.length; i++) {
      if ($scope.ets[i].id === ets){
          $scope.ets[i].counter = true;
      } 
    }
  }
/*
  $scope.clkInitialState =  function(){
    $scope.backs.length = 0;
    $scope.freeMode = false;
    alert("You can choose a new initial state for your path.");
  };*/

  $scope.parserCont = function(content){
    var currentline, label,neigth,ini,des;
    var lines = content.split("\n");
    for (var i = 0; i < lines.length; i++) {
      if(lines[i].length > 1){
        if(i === 0){
          var currentline = lines[i].split("\n");
          currentline = lines[i].replace(/[\(\)]/g, '');  
          currentline = currentline.replace(/,/g, '');   
          currentline = currentline.split(" ");
          var eta1 = new Etat(parseInt(currentline[1]),'RED',false);
          $scope.ets.push(eta1);
        } else {
          currentline = lines[i].split("\n");
          currentline = lines[i].replace(/[\(\)]/g, '');
          currentline = currentline.replace(/['"]+/g, '');
          currentline = currentline.split(",",3);
          label = currentline[1].split(":");
          if(currentline[0].indexOf("N") != -1){
            neigth = currentline[0].split(":",3);
             ini = parseInt(neigth[0]);
             des = parseInt(currentline[2])
             if(ini === des){
              var tran = new Transition(ini,label[0],label[1],des,0.95);
              $scope.trans.push(tran);
              $scope.validate(ini);
              $scope.validate(des);
             }else{
              $scope.curveLinesValidation(ini,label[0],label[1],des);
             }
            $scope.neigthB(neigth);
          }else {
            ini = parseInt(currentline[0]);
            des = parseInt(currentline[2]);
            if(ini === des){
              var tran = new Transition(ini,label[0],label[1],des,0.95);
              $scope.trans.push(tran);
              $scope.validate(ini);
              $scope.validate(des);
            }else{
              $scope.curveLinesValidation(ini,label[0],label[1],des);
            }
          }
        }
      }
    }
  };


  $scope.curveLinesValidation= function(init,label1,label2,destination){
    var band = false;
    if($scope.trans.length>0){
      for (var i = 0; i < $scope.trans.length; i++) {
        if(init === $scope.trans[i].target && destination === $scope.trans[i].source){
          $scope.trans[i].curvature = 0.8;
          band = true;
        }
      }

      if(band){
        var tran = new Transition(init,label1,label2,destination,0.8);
        $scope.trans.push(tran);
        $scope.validate(init);
        $scope.validate(destination);
      }else{
        var tran = new Transition(init,label1,label2,destination,0);
        $scope.trans.push(tran);
        $scope.validate(init);
        $scope.validate(destination);
      }

    }else{
      var tran = new Transition(init,label1,label2,destination,0);
      $scope.trans.push(tran);
      $scope.validate(init);
      $scope.validate(destination);
    }
  }
  
  $scope.draw = function(){
    var automateObject = new Automate($scope.ets,$scope.trans);
    $scope.gData = automateObject;
    var wid = $("#graph").width();
    var hei = $(window).height() - 70;
    console.log(wid +"  -- "+hei);
    var myGraph = ForceGraphVR();
      myGraph(document.getElementById('3d-graph'))
        .graphData(automateObject)
        .backgroundColor('#848484')
        .width(wid+"px")
        .height(hei+"px")
        .linkColor('group')
        .linkCurvature('curvature')
        .nodeLabel("id")
        .linkLabel("name")
        .linkDirectionalParticles(3)
        .linkDirectionalParticleWidth(2);
  };

/*  $scope.validationCounter = function(nd){
    var isvalide = false;
    for (var i = 0; i < $scope.ets.length; i++) {
      if($scope.ets[i].id === nd && $scope.ets[i].counter){
        isvalide = true;
      } 
    }
    return isvalide;
  }*/
  
  $scope.neigthB = function(etat){
    var flag = false;
    var eti;
    for (var i = 0; i < $scope.ets.length; i++) {
      if($scope.ets[i].id === parseInt(etat[0])){
        switch (etat[2]) {
          case "G":
            $scope.ets[i].color = '#B18904';
            break;
          case "R":
            $scope.ets[i].color = '#FE9A2E';
            break;
          case "GR":
            $scope.ets[i].color = '#FACC2E';
            break;
          case "GRB":
            $scope.ets[i].color = '#F7FE2E';
            break;
          default:
            break;
        }
        flag = true;
      }
    }

    if(!flag){
      switch (etat[2]) {
        case "G":
          eti = new Etat(parseInt(etat[0]),'#B18904',false);
          $scope.ets.push(eti);
          break;
        case "R":
          eti = new Etat(parseInt(etat[0]),'#FE9A2E',false);
          $scope.ets.push(eti);
          break;
        case "GR":
          eti = new Etat(parseInt(etat[0]),'#FACC2E',false);
          $scope.ets.push(eti);
          break;
        case "GRB":
          eti = new Etat(parseInt(etat[0]),'#F7FE2E',false);
          $scope.ets.push(eti);
          break;
        default:
          break;
      }
    }
  };

  $scope.validate = function(eta){
    var flag = false;
    var eti;
    for (var i = 0; i < $scope.ets.length; i++) {
      if($scope.ets[i].id === eta){
        flag = true;
      }
    }

    if(!flag){
      if(eta === -1){
        eti = new Etat(eta,'GREEN',false);
        $scope.sinkState = true;
        $scope.ets.push(eti);
      }else{
        eti = new Etat(eta,'BLUE',false);
        $scope.ets.push(eti);
      }

    }
  }

  $scope.validationWay = function(etatNext){
    var flag = false;
    if($scope.backs[$scope.backs.length-1].id === etatNext){
      alert("This is already your current state.");
    }else{
     for (var i = 0; i < $scope.trans.length; i++) {
       if($scope.backs[$scope.backs.length-1].id === $scope.trans[i].source.id && $scope.trans[i].target.id === etatNext){
          $scope.backs[$scope.backs.length-1].txt = $scope.trans[i].name;
          flag = true;
        }
      } 
    }
    return flag;
  }

   $scope.validationWayCounter = function(etatNext){
      var flag = false;
      if($scope.backs[$scope.backs.length-1].id === etatNext){
        alert("This is already your current state.");
      }else{
       for (var i = 0; i < $scope.trans.length; i++) {
         if($scope.backs[$scope.backs.length-1].id === $scope.trans[i].source.id && $scope.trans[i].target.id === etatNext && $scope.trans[i].group === "#FFFF00"){
            $scope.backs[$scope.backs.length-1].txt = $scope.trans[i].name;
            flag = true;
          }
        } 
      }
      return flag;
    }
});

myapp.directive('onReadFile', function ($parse) {
  return {
    restrict: 'A',
    scope: false,
    link: function(scope, element, attrs) {
      var fn = $parse(attrs.onReadFile);
      element.on('change', function(onChangeEvent) {
        var reader = new FileReader();
        reader.onload = function(onLoadEvent) {
          scope.$apply(function() {
            fn(scope, {$fileContent:onLoadEvent.target.result});
          });
        };
        reader.readAsText((onChangeEvent.srcElement || onChangeEvent.target).files[0]);
      });
    }
  };
});