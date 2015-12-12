'use strict';

window.twttr = (function(d, s, id) {
  var js, fjs = d.getElementsByTagName(s)[0],
    t = window.twttr || {};
  if (d.getElementById(id)) return t;
  js = d.createElement(s);
  js.id = id;
  js.src = "https://platform.twitter.com/widgets.js";
  fjs.parentNode.insertBefore(js, fjs);
 
  t._e = [];
  t.ready = function(f) {
    t._e.push(f);
  };

	  return t;
  }(document, "script", "twitter-wjs"));

angular.module('PoliticalApp', ['ui.router', 'ui.bootstrap', 'firebase'])
.config(function($stateProvider){
	$stateProvider
		.state('home', {
		url: '/', //"root" directory
		templateUrl: 'partials/home.html',
		controller: 'HomeCtrl'
		})
		.state('politicalfeed', {
			url: '/feed',
			templateUrl: 'partials/politicalfeed.html',
			controller: 'FeedCtrl'
		})
		.state('poll', {
			url: '/poll',
			templateUrl: 'partials/poll.html',
			controller: 'PollCtrl'
		})	
		.state('statistics', {
			url: '/statistics/{id}',
			templateUrl: 'partials/statistics.html',
			controller: 'StatisticsCtrl'
		})
		.state('memes', {
		url: '/memes',
		templateUrl: 'partials/memes.html',
		controller: 'MemeCtrl'
		})
		.state('about', {
		url: '/about',
		templateUrl: 'partials/about.html',
		controller: 'AboutCtrl'
		})

})

.controller('FeedCtrl', ['$scope', '$http', '$window', function($scope, $http, $window) {
	$http.get('./data/candidates.json')
       .then(function(res){
          $scope.candidates = res.data;                
        }); 
    $scope.loadWidgets = function(ID){
    	var currTimeline = angular.element( document.querySelector( '#timeline' ) );
		currTimeline.empty();
		
    	twttr.widgets.createTimeline(
		  ID,
		  document.getElementById('timeline'),
		  {
		    width: '700',
		    height: '2000',
		  }).then(function (el) {
		    console.log("Timeline updated.")
		  });
    }
}])

.controller('PollCtrl', ['$scope', '$firebaseObject', '$firebaseArray', '$firebaseAuth', function($scope, $firebaseObject, $firebaseArray, $firebaseAuth) {
	var ref = new Firebase("https://politweets.firebaseio.com/");
	var pollRef = ref.child("polls");

	var pollSubmitted = [];
	$scope.polls = $firebaseArray(pollRef);
	$scope.polls.$loaded().then(function(polls) {
		
		for (var i = 0; i < $scope.polls.length; i++) {
			pollSubmitted.push(false);	
		}

	})


	$scope.addValue = function(option, poll) {
		var loc = $scope.polls.indexOf(poll);
		var a = $scope.polls[loc].options.indexOf(option);
		if (!pollSubmitted[loc]) {
			$scope.polls[loc].options[a][1] += 1;
			console.log($scope.polls[loc].options[a][1]);
			$scope.polls.$save($scope.polls[loc]).catch(function(error) {
				console.log(error);
			});
			pollSubmitted[loc] = true;
		}
	};
	$scope.resetForm = function(){
        $scope.pollForm = {};
        $scope.pollForm.options = [];
    };
    // call one reset on load for object declaration
    $scope.resetForm();
    // Add a poll option to the creation form
    $scope.addPollOption = function(){
        $scope.pollForm.options.push(['', '0']);
    };
    // remove pull option from the form
    $scope.removeOption = function(index){
        $scope.pollForm.options.splice(index,1);
    };

    // Create a new poll
    $scope.pollCreate = function(){
        // add to poll to the Firebase object - this will update it at the server
        // check for empty options
        for (var i = 0; i < $scope.pollForm.options.length; i++){
            // make sure no empty options
            if (angular.isUndefined($scope.pollForm.options[i][0]) || $scope.pollForm.options[i][0]=='') {
            	$scope.pollForm.options.splice(i,1)
            }
            $scope.pollForm.options[i][1] = 0;
        }
        if ($scope.pollForm.name && ($scope.pollForm.options.length>0))
        {
            // add the new form to the firebase object. it will be updated automagically in firebase
            $scope.polls.$add($scope.pollForm);
            // reset the poll creation form
            $scope.resetForm();
        }
    };

}])

.controller('StatisticsCtrl', ['$scope', '$http', '$firebaseObject', '$firebaseArray', '$firebaseAuth', function($scope, $http, $firebaseObject, $firebaseArray, $firebaseAuth) {
	// want to find a way where buttons change values appearring on chart
	var percentGraph = $("#percentages").get(0).getContext("2d");
	var percentGraph2 = $("#percentages2").get(0).getContext("2d");
	var pollGraph = $("#polls").get(0).getContext("2d");

	$scope.menu = document.getElementById('demChart');
	$scope.menu2 = document.getElementById('gopChart');
	$scope.pollMenu = document.getElementById('pollBar');
	var currentSelect;
	var currentSelect2;

	//initizizes values for blank graphs
	var val1 = 100;
	var val2 = 0;
	var val3 = 0;
	var val4 = 0;
	var val5 = 0;

	var name1 = "";
	var name2 = "";
	var name3 = "";

	// initial title for doughnut 
	$scope.demSelect = "Democratic Polls";
	$scope.gopSelect = "Republican Polls";
	$scope.fireSelect = "PoliTweets' Polls";

	//initializes firebase polls
	var ref = new Firebase("https://politweets.firebaseio.com/");
	var pollRef = ref.child("polls");
	$scope.polls = $firebaseArray(pollRef);
	console.log($scope.polls);

	//data for initializing graphs
	var percentData = [
		{
			// import candidate values and name via API
			// each object is slice of pie/doughnut chart
			value: val1,
			color: "#2A2AFF",
			highlight: "#5151FF",
			label: name1
		},
		{
			value: val2,
			color: "cornflowerblue",
			highlight: "lightskyblue",
			label: name2
		},
		{
			value: val3,
			color: "#0000B7",
			highlight: "#2A2AC2",
			label: name3
		},
		{
			value: val4,
			color: "#272727",
			highlight: "#3F3F3F",
			label: "Undecided"
		},
		{
			value: val5,
			color: "grey",
			highlight: "#9A9A9A",
			label: "Other"
		}
	];
	//initial bar data (empty)
	var pollData = {
		labels: [""],
		datasets: [
			{
				label: "Poll Numbers",
				// all colors should be changed to more appropriate political colors
				fillColor: "#2B1B6F",
				strokeColor: "#FFA800",
				highlightFill: "#2B1B6F",
				highlightStroke: "#FFA800",
				// values dependent on api
				data: [0]
			}
		]
	};

	// $http.jsonp('http://elections.huffingtonpost.com/pollster/api/polls.json').then(function(response){

	// 	$scope.pollData = response.data;
	// 	console.log($scope.pollData);
	// });

	// $http.jsonp('http://elections.huffingtonpost.com/pollster/api/charts/2016-national-gop-primary.json').then(function(response){
	// 	$scope.gopData = response.data;
	// 	console.log($scope.gopData);
	// })

	// $http.jsonp('http://elections.huffingtonpost.com/pollster/api/charts/2016-national-democratic-primary.json').then(function(response){
	// 	$scope.demData = response.data;
	// 	console.log($scope.demData);
	// })

	//initializes first chart then changes color values and initializes GOP chart
	var chart1 = new Chart(percentGraph).Doughnut(percentData);
	percentData[0].color = "red";
	percentData[0].highlight = "#D64343";
	percentData[1].color = "#FF4444";
	percentData[1].highlight = "#FFBDBD";
	percentData[2].color = "#920000";
	percentData[2].highlight = "#A52E2E";
	var chart2 = new Chart(percentGraph2).Doughnut(percentData);

	var pollChart = new Chart(pollGraph).Bar(pollData);

	// checks which democratic data is selected
	$scope.demIndexChange = function(){
		if($scope.menu.value == "National Democratic"){
			currentSelect = $scope.demData;
		}
		if($scope.menu.value == "Ohio Democratic"){
			currentSelect = $scope.demOH;
		}
		if($scope.menu.value == "California Democratic"){
			currentSelect = $scope.demCA;
		}
		if($scope.menu.value == "Pennsylvania Democratic"){
			currentSelect = $scope.demPA;
		}
		$scope.demSelect = $scope.menu.value + " Poll";
		$scope.menu.value = "";
		
		valueChanges(currentSelect, chart1);
	}

	//checks to see which GOP data is selected
	$scope.gopIndexChange = function(){
		if($scope.menu2.value == "National Republican"){
			currentSelect = $scope.gopData;
		}
		if($scope.menu2.value == "Ohio Republican"){
			currentSelect = $scope.gopOH;
		}
		if($scope.menu2.value == "Florida Republican"){
			currentSelect = $scope.gopFL;
		}
		if($scope.menu2.value == "Iowa Republican"){
			currentSelect = $scope.gopIA;
		}
		$scope.gopSelect = $scope.menu2.value + " Poll";
		$scope.menu2.value = "";

		valueChanges(currentSelect, chart2);
	}

	//finds chosen poll and sends values for updating
	$scope.pollIndexChange = function(){
		var pollChoiceIndex = $scope.pollMenu.selectedIndex;
		var pollQ = $scope.polls[pollChoiceIndex];
		$scope.fireSelect = pollQ.name;
		var pollOptions = pollQ.options;

		var valArr = [];
		var nameArr = [];

		for(var i=0; i<pollOptions.length; i++){
			valArr[i] = pollOptions[i][1];
			nameArr[i] = pollOptions[i][0];
		}
		console.log(valArr);
		console.log(nameArr);
		updateBar(valArr, nameArr);
	}

	//finds values of currenly selected json 
	var valueChanges = function(currentSelect, chartType){
		val1 = currentSelect.estimates[0].value;
		val2 = currentSelect.estimates[1].value;
		val3 = currentSelect.estimates[2].value;
		val4 = currentSelect.estimates[3].value;
		val5 = currentSelect.estimates[4].value;
		name1 = currentSelect.estimates[0].choice;
		name2 = currentSelect.estimates[1].choice;
		name3 = currentSelect.estimates[2].choice;

		updateGraph(val1, val2, val3, val4, val5, name1, name2, name3, chartType);
	}

	// updates doughnut chart with new values
	// this is easier due to a static number of slices
	var updateGraph = function(val1, val2, val3, val4, val5, name1, name2, name3, chartName){
		chartName.segments[0].value = val1;
		chartName.segments[1].value = val2;
		chartName.segments[2].value = val3;
		chartName.segments[3].value = val4;
		chartName.segments[4].value = val5;
		chartName.segments[0].label = name1;
		chartName.segments[1].label = name2;
		chartName.segments[2].label = name3;

		chartName.update();
	}

	// changes bar graph if new selection is chosen
	var updateBar = function(valArr, nameArr){
		var pollLength = pollData.labels.length;

		// removes graph's data completely (chart.js has limited method options for data manipulation)
		for(var i=0; i<pollLength; i++){
			pollChart.removeData();
		}
		// adds new data back into graph
		for(var i=0; i<valArr.length; i++){
			pollChart.addData([valArr[i]], nameArr[i]);
		}

		// while(pollLength != valArr.length){
		// 	if(pollLength <= valArr.length){
		// 		pollChart.addData([valArr[pollLength-1]], nameArr[pollLength-1]);
		// 		pollLength++;
		// 	}else{
		// 		pollChart.labels[pollLength-1] = undefined;
		// 		pollChart.datasets[0].bars[pollLength-1].value = undefined;
		// 		pollLength--;
		// 	}
		// }
		// console.log(pollLength);
		// console.log(valArr.length);

		pollChart.update();
	}


	// brings in local json files for graphs
	$http.get('data/2016-national-gop-primary.json').then(function(response){
		$scope.gopData = response.data;
	})
	$http.get('data/2016-national-democratic-primary.json').then(function(response){
		$scope.demData = response.data;
	})
	$http.get('data/2016-ohio-democratic-presidential-primary.json').then(function(response){
		$scope.demOH = response.data;
	})
	$http.get('data/2016-ohio-republican-presidential-primary.json').then(function(response){
		$scope.gopOH = response.data;
	})
	$http.get('data/2016-florida-presidential-republican-primary.json').then(function(response){
		$scope.gopFL = response.data;
		console.log($scope.gopFL);
	})
	$http.get('data/2016-california-democratic-presidential-primary.json').then(function(response){
		$scope.demCA = response.data;
		console.log($scope.demCA);
	})
	$http.get('data/2016-iowa-presidential-republican-primary.json').then(function(response){
		$scope.gopIA = response.data;
	})
	$http.get('data/2016-pennsylvania-democratic-presidential-primary.json').then(function(response){
		$scope.demPA = response.data;	
	})

}])

.controller('HomeCtrl', ['$scope', '$http', function($scope, $http) {

}])

.controller('AboutCtrl', ['$scope', '$http', function($scope, $http) {

}])

.controller('MemeCtrl', ['$scope', '$http', function($scope, $http) {

}])


.config(function($urlRouterProvider){
    // if the path doesn't match any of the urls you configured
    // otherwise will take care of routing the user to the specified url
    $urlRouterProvider.otherwise('/');
})