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
			url: '/feed', //"root" directory
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

	$scope.polls = $firebaseArray(pollRef);

	/*
	$scope.addPoll = function() {
		$scope.polls.$add({
			name: $scope.pollHeader,
			options: [{
				0: $scope.choice1,
				1: 0
			}, {
				0: $scope.choice2,
				1: 0
			}, {
				0: $scope.choice3,
				1: 0
			}, {
				0: $scope.choice4,
				1: 0
			}],
		})
	}

*/
	$scope.addValue = function(option, poll) {
		var loc = $scope.polls.indexOf(poll);
		var a = $scope.polls[loc].options.indexOf(option);
		$scope.polls[loc].options[a][1] += 1;
		console.log($scope.polls[loc].options[a][1]);
		$scope.polls.$save($scope.polls[loc]).catch(function(error) {
			console.log(error);
		});
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
	var candidateBar = $("#candidates").get(0).getContext("2d");

	var menu = document.getElementById('chooseChart');
	var currentSelect;

	var val1 = 100;
	var val2 = 100;
	var val3 = 100;
	var val4 = 100;
	var val5 = 100;

	var name1 = "Candidate 1"
	var name2 = "Candidate 2"
	var name3 = "Candidate 3"


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
			color: "red",
			highlight: "#D64343",
			label: name2
		},
		{
			value: val3,
			color: "grey",
			highlight: "#9A9A9A",
			label: name3
		},
		{
			value: val4,
			color: "#FF4444",
			highlight: "#FFBDBD",
			label: "Undecided"
		},
		{
			value: val5,
			color: "#2A2AFF",
			highlight: "#5151FF",
			label: "Other"
		}
	];

	var updateGraph = function(val1, val2, val3, val4, val5, name1, name2, name3){
		percentData[0].value = val1;
		percentData[1].value = val2;
		percentData[2].value = val3;
		percentData[3].value = val4;
		percentData[4].value = val5;
		percentData[0].label = name1;
		percentData[1].label = name2;
		percentData[2].label = name3;

		//chart.update();

		chart = new Chart(percentGraph).Doughnut(percentData);
	}

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

	// grab CandidateData
	$http.get('data/candidates.json').then(function(response) {
 		$scope.candidates = response.data;
 	});


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

	$http.get('data/2016-national-gop-primary.json').then(function(response){
		$scope.gopData = response.data;
		console.log($scope.gopData);
	})

	$http.get('data/2016-national-democratic-primary.json').then(function(response){
		$scope.demData = response.data;
		console.log($scope.demData);
	})

	$http.get('data/2016-ohio-democratic-presidential-primary.json').then(function(response){
		$scope.demOH = response.data;
		console.log($scope.demOH);
	})

	$http.get('data/2016-ohio-republican-presidential-primary.json').then(function(response){
		$scope.gopOH = response.data;
		console.log($scope.gopOH);
	})

	var chart = new Chart(percentGraph).Doughnut(percentData);
	var chart2 = new Chart(candidateBar).Bar(candidateData);

	$scope.indexChange = function(){
		if(menu.value == "democratic"){
			currentSelect = $scope.demData;
		}
		if(menu.value == "republican"){
			currentSelect = $scope.gopData;
		}
		if(menu.value == "demOH"){
			currentSelect = $scope.demOH;
		}
		if(menu.value == "gopOH"){
			currentSelect = $scope.gopOH;
		}

		val1 = currentSelect.estimates[0].value;
		val2 = currentSelect.estimates[1].value;
		val3 = currentSelect.estimates[2].value;
		val4 = currentSelect.estimates[3].value;
		val5 = currentSelect.estimates[4].value;
		name1 = currentSelect.estimates[0].choice;
		name2 = currentSelect.estimates[1].choice;
		name3 = currentSelect.estimates[2].choice;

		console.log(val1);
		updateGraph(val1, val2, val3, val4, val5, name1, name2, name3);
	}

}])

.controller('HomeCtrl', ['$scope', '$http', function($scope, $http) {

}])

.controller('AboutCtrl', ['$scope', '$http', function($scope, $http) {

}])


.config(function($urlRouterProvider){
    // if the path doesn't match any of the urls you configured
    // otherwise will take care of routing the user to the specified url
    $urlRouterProvider.otherwise('/');
})