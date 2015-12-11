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

.controller('StatisticsCtrl', ['$scope', '$http', function($scope, $http) {
	// want to find a way where buttons change values appearring on chart
	var percentGraph = $("#percentages").get(0).getContext("2d");
	var percentGraph2 = $("#percentages2").get(0).getContext("2d");

	var menu = document.getElementById('demChart');
	var menu2 = document.getElementById('gopChart');
	var currentSelect;
	var currentSelect2;

	var val1 = 100;
	var val2 = 0;
	var val3 = 0;
	var val4 = 0;
	var val5 = 0;

	var name1 = ""
	var name2 = ""
	var name3 = ""


	var percentData = [
		{
			// import candidate values and name via API
			// each object is slice of pie/doughnut chart
			value: val1,
			color: "cornflowerblue",
			highlight: "lightskyblue",
			label: name1
		},
		{
			value: val2,
			color: "grey",
			highlight: "#9A9A9A",
			label: name2
		},
		{
			value: val3,
			color: "#2A2AFF",
			highlight: "#5151FF",
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
			color: "#0000B7",
			highlight: "#2A2AC2",
			label: "Other"
		}
	];

	var candidateData = {
		labels: ["Bernie Sanders", "Hilary Clinton", "Donald Trump", "Ted Cruz", "Marco Rubio"],
		datasets: [
			{
				label: "Poll Numbers",
				// all colors should be changed to more appropriate political colors
				fillColor: "#E72020",
				strokeColor: "#AD0000",
				highlightFill: "#EE6262",
				highlightStroke: "#EA4141",
				// values dependent on api
				data: [93, 93, 37, 57, 74]
			},
			{
				// Need another value not percentage can add additional
				label: "Corporate Funding",
				fillColor: "#416EFF",
				strokeColor: "#003CFF",
				highlightFill: "#66C7FF",
				highlightStroke: "#00A2FF",
				data: [71, 94, 10, 18, 39]
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
	percentData[2].color = "#FF4444";
	percentData[2].highlight = "#FFBDBD";
	percentData[4].color = "#920000";
	percentData[4].highlight = "#A52E2E";
	var chart2 = new Chart(percentGraph2).Doughnut(percentData);



	$scope.demIndexChange = function(){
		if(menu.value == "democratic"){
			currentSelect = $scope.demData;
		}
		if(menu.value == "demOH"){
			currentSelect = $scope.demOH;
		}
		if(menu.value == "demCA"){
			currentSelect = $scope.demCA;
		}
		
		valueChanges(currentSelect, chart1);
	}

	$scope.gopIndexChange = function(){
		if(menu2.value == "republican"){
			currentSelect = $scope.gopData;
		}
		if(menu2.value == "gopOH"){
			currentSelect = $scope.gopOH;
		}
		if(menu2.value == "gopFL"){
			currentSelect = $scope.gopFL;
		}

		valueChanges(currentSelect, chart2);
	}

	var valueChanges = function(currentSelect, chartType){
		val1 = currentSelect.estimates[0].value;
		val2 = currentSelect.estimates[1].value;
		val3 = currentSelect.estimates[2].value;
		val4 = currentSelect.estimates[3].value;
		val5 = currentSelect.estimates[4].value;
		name1 = currentSelect.estimates[0].choice;
		name2 = currentSelect.estimates[1].choice;
		name3 = currentSelect.estimates[2].choice;

		console.log(name1);
		updateGraph(val1, val2, val3, val4, val5, name1, name2, name3, chartType);
	}

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