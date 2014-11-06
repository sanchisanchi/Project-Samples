/*An instance of Ember.Application is created for this application*/
App = Ember.Application.create({
  LOG_TRANSITIONS: true
});

/**
 * This method specifies the routes for the application
 *
*/
App.Router.map(function() {
  this.route('signin', {path: '/signin'});
  
  this.resource('employerPublic', {path: '/employer/:employer_id/public'});
  this.resource('employerPrivate', { path: '/employer/:employer_id' });
  this.route('addJob', { path: '/employer/:employer_id/add_job'});
  this.resource('jobPublic', {path: '/employer/:employer_id/job/:job_id/public'});
  this.resource('jobPrivate', {path: '/employer/:employer_id/job/:job_id'});
  this.route('jobEdit', {path: '/employer/:employer_id/job/:job_id/edit'});
  this.resource('candidateListJob', {path: '/employer/:employer_id/job/:job_id/candidates/:category'});
  this.resource('candidateListEmployer', {path: '/employer/:employer_id/candidates/:category'});
  this.resource('candidate', {path: '/employer/:employer_id/candidate/:candidate_id'});

  this.route('applyEmployer', {path: '/employer/:employer_id/public/apply'});
  this.route('applyJob', {path: '/employer/:employer_id/job/:job_id/public/apply'});
  
});

/**
 * @class ApplicationController
 *
 * Validates the sign-in and sign-out process. Based on the checking every path matching with the 
 * sign-in/sign-out, this controller will specify the link and the modal, which will specify the path
 * and gets the model associated to that path
 *
 * @namespace App
 * @extends Ember.Controller
 */
App.ApplicationController = Ember.Controller.extend({
  isSignedIn: false,
  currentUser: "",
  applicationTrail: [],
  // The current status of MyCandidates index page.
  indexIsCurrent: "not-current",

  // Keep track of the current path to highlight the breadcrumb
  highlightBreadcrumb: function() {
    // Update application trail is called first

    // Update the application trail to highlight the current route
    var trail = this.get('applicationTrail');

    for (var i = 0; i < trail.length; ++i) {
      if(trail[i].link.name === this.get('currentPath')) {
        Ember.set(trail.objectAt(i), "isCurrent", "current");
      }
      else {
        Ember.set(trail.objectAt(i), "isCurrent", "not-current");
      }
    }

    // Since Index is not a part of the Application Trail
    // have to check it here
    if (this.get('currentPath') === "index") {
      this.set('indexIsCurrent', "current");
    }
    else
      this.set('indexIsCurrent', "not-current");

  }.observes('currentPath'),

  actions: {
	/**
	 * This method validates the user id if signing in
	 *
	 * @param {String} username
	*/
    signIn: function(username) {
      if (username === undefined) {
        //console.log("Sign in from menu bar");
        this.transitionToRoute('signin');
      }
      else {
        //console.log("Sign in from SignIn", username);
        // Check valid user id
        if (privateEmployerList.findBy('netId', username) !== undefined) {
          this.set('isSignedIn', true);
          this.transitionToRoute('employerPrivate', {netId: username});
          this.set('currentUser', username);
        }
      }
    },

	/**
	 * If user sign-out, then specifies the route of the page
	*/
    signOut: function() {
      this.set('isSignedIn', false);
      this.set('applicationTrail', []);
      
      //console.log("Signed out");
      if (this.get('currentUser') === null) {
        this.transitionToRoute('index');
      }
      else {
        this.transitionToRoute('employerPublic', 
          {employerNetId: this.get('currentUser')});
        this.set('currentUser', "");
      }
    },

	/**
	 * Needs comments
	 *
	 * @param {String} path
	 * @param {Model} aModel
	*/
    updateApplicationTrail: function(path, aModel) {
      /*if (path === "index") {
        this.set('applicationTrail', []);
      }
      else */if (path  === "employerPublic" && this.get('isSignedIn') === false) {
        if (this.get('applicationTrail').length === 0 ||
          (this.get('applicationTrail')[0].link.model.employerNetId !== aModel.netId &&
          this.get('applicationTrail')[0].link.model.netId !== aModel.netId) ) {
            this.set('applicationTrail', [{
              label: "Home",
              link: {
                name: path,
                model: {employerNetId: aModel.netId}
              }
            }]);
        }
      }
      else if (path === "jobPublic" && this.get('isSignedIn') === false) {
        if (this.get('applicationTrail').length < 2 || 
          this.get('applicationTrail')[1].link.model.id !== aModel.id)
            this.set('applicationTrail', [{
              label: "Home",
              link: {
                name: "employerPublic",
                model: aModel
              }
            }, {
              label: "Job #" + aModel.id,
              link: {
                name: path,
                model: {employerNetId: aModel.employerNetId, id: aModel.id}
                // If we want to avoid a getData: pass aModel to model above.
              }
            }]);
      }
      else if (path === "applyEmployer" && this.get('isSignedIn') === false) {
        this.set('applicationTrail', [{
          label: "Home",
          link: {
            name: "employerPublic",
            model: aModel
          }
        }, {
          label: "Apply",
          link: {
            name: path,
            model: aModel
          }
        }]);
      }
      else if (path === "applyJob" && this.get('isSignedIn') === false) {
        this.set('applicationTrail', [{
          label: "Home",
          link: {
            name: "employerPublic",
            model: aModel
          }
        }, {
          label: "Job #" + aModel.id,
          link: {
            name: "jobPublic",
            model: aModel
          }
        }, {
          label: "Apply",
          link: {
            name: path,
            model: aModel
            // If we want to avoid a getData: pass aModel to model above.
          }
        }]);
      }
      else if(path === 'employerPrivate') {
        if (this.get('applicationTrail').findBy('link.name', path) === undefined) {
          this.set('applicationTrail', [{
                label: "Home",
                link: {
                  name: path,
                  model: {netId: aModel.netId}
                  // If we want to avoid a getData: pass aModel to model above.
                }
          }]);
        }
      }
      else if (path === "addJob") {
        this.set('applicationTrail', [{
          label: "Home",
          link: {
            name: "employerPrivate",
            model: aModel
          }
        }, {
          label: "Add Job",
          link: {
            name: path,
            model: aModel
          }
        }]);
      }
      else if (path === "jobPrivate") {
        var currentLink = this.get('applicationTrail').findBy('link.name', path);
        
        if (currentLink === undefined || currentLink.link.model.id !== aModel.id) {
          this.set('applicationTrail', [{
            label: "Home",
            link: {
              name: "employerPrivate",
              model: {netId: aModel.employerNetId}
            }
          }, {
            label: "Job #" + aModel.id,
            link: {
              name: path,
              model: {employerNetId: aModel.employerNetId, id: aModel.id}
              // If we want to avoid a getData: pass aModel to model above.
            }
          }]);
        }
      }
      else if (path === "jobEdit") {
        var currentLink = this.get('applicationTrail').findBy('link.name', path);
        
        if (currentLink === undefined || currentLink.link.model.id !== aModel.id) {
          this.set('applicationTrail', [{
            label: "Home",
            link: {
              name: "employerPrivate",
              model: {netId: aModel.employerNetId}
            }
          }, {
            label: "Job #" + aModel.id,
            link: {
              name: "jobPrivate",
              model: {employerNetId: aModel.employerNetId, id: aModel.id}
              // If we want to avoid a getData: pass aModel to model above.
            }
          }, {
            label: "Edit",
            link: {
              name: path,
              model: {employerNetId: aModel.employerNetId, id: aModel.id}
              // If we want to avoid a getData: pass aModel to model above.
            }
          }]);
        }
      }
      else if (path === "candidateListJob") {
        var currentLink = this.get('applicationTrail').findBy('link.name', path);
        
        if (currentLink === undefined || currentLink.link.model.category !== aModel.category
          || currentLink.link.model.jobId !== aModel.jobId) {
          this.set('applicationTrail', [{
            label: "Home",
            link: {
              name: "employerPrivate",
              model: {netId: aModel.employerNetId}
            }
          }, {
            label: "Job #" + aModel.jobId,
            link: {
              name: "jobPrivate",
              model: {employerNetId: aModel.employerNetId, id: aModel.jobId}
            }
          }, {
            label: aModel.category + " Candidates",
            link: {
              name: path,
              model: {employerNetId: aModel.employerNetId, jobId: aModel.jobId,
                category: aModel.category.toLowerCase()}
              // If we want to avoid a getData: pass aModel to model above.
            }
          }]);
        }
      }
      else if (path === "candidateListEmployer") {
        var currentLink = this.get('applicationTrail').findBy('link.name', path);
        
        if (currentLink === undefined || currentLink.link.model.category !== aModel.category) {
          this.set('applicationTrail', [{
            label: "Home",
            link: {
              name: "employerPrivate",
              model: {netId: aModel.employerNetId}
            }
          }, {
            label: aModel.category + " Candidates",
            link: {
              name: path,
              model: {employerNetId: aModel.employerNetId,
                category: aModel.category.toLowerCase()}
              // If we want to avoid a getData: pass aModel to model above.
            }
          }]);
        }
      }
      else if (path === "candidate") {
        var currentLink = this.get('applicationTrail').findBy('link.name', path);
        
        if (currentLink === undefined || currentLink.link.model.id !== aModel.id) {
          this.set('applicationTrail', [{
            label: "Home",
            link: {
              name: "employerPrivate",
              model: {netId: aModel.employerNetId}
            }
          }, {
            label: "Candidate #" + aModel.id,
            link: {
              name: path,
              model: {employerNetId: aModel.employerNetId, id: aModel.id}
              // If we want to avoid a getData: pass aModel to model above.
            }
          }]);
        }
      }
    } /*End of updateApplicationTrail*/
  } /*End of action*/
}); /*End of ApplicationControlller*/

/**
 * @class IndexRoute
 *
 * When Application is loaded, the very first page the application will route
 * to will be the homepage.
 *
 * @namespace App
 * @extends Ember.Route
 */
App.IndexRoute = Ember.Route.extend({
	/**
	 * Updates the Application trail to homepage.
	 */
  beforeModel: function() {
    document.title = "MyCandidates";
    this.controllerFor("application").send('updateApplicationTrail', 'index');
  }
});

/**
 * @class SigninController
 *
 * When user sign-in, the function gets the controller
 * and sends the user info, and sets to current.
 *
 * @namespace App
 * @extends Ember.Controller
 */
App.SigninController = Ember.Controller.extend({
  needs: ["application"],
  username: "",
  actions: {
	/**
	 * Sends the username to the controller.
	 */  
    signIn: function() {
      if (this.username !== "")
        this.get('controllers.application').send("signIn", this.username);
        this.set("username", "");
    },
  }
});

/**
 * @class SigninController
 *
 * Initially sets the route to sign-in
 *
 * @namespace App
 * @extends Ember.Route
 */
App.SigninRoute = Ember.Route.extend({
  beforeModel: function(){
    document.title = "MyCandidates - Sign-In";
  }
});

/**
 * @class EmployerPublicRoute
 * When page is routed to public employer page, the setupController function
 * will get the job model, and return it based on employer id.
 *
 * @namespace App
 * @extends Ember.Route
 */
App.EmployerPublicRoute = Ember.Route.extend({
	/**
	 * This method gets the modal based from employer net id, set the controller,
	 * and changes the site'name as well update the application trail.
	 * @param {Controller} controller
	 * @param {Model} model
	 */  
  setupController: function(controller, model) {
    if (model.jobs === undefined) {
      //console.log("From back button");
      var result = this.getData(model.employerNetId);
      controller.set('model', result);
    }
    else if (model.events !== undefined) {
      //console.log("From private employers");
      var result = this.getData(model.netId);
      controller.set('model', result); 
    }
    else {
      controller.set('model', model);
    }
    // Change site's name
    document.title = "MyCandidates - " + controller.get('model').name;

    // Change application trail
    this.controllerFor("application").send(
      'updateApplicationTrail', "employerPublic", controller.get('model'));
  },

  	/**
	 * This method returns data associated with employer id.
	 * @return {String}
	 */  
  model: function(params) {
    //console.log("From model");
    return this.getData(params.employer_id);
  },

  /**
	 * This method returns list of public employer by their id.
	 * @return {String}
	 */
  getData: function(employer_id) {
    return publicEmployerList.findBy('netId', employer_id);
  },

  serialize: function(model) {
    if (model.employerNetId)
      return {employer_id: model.employerNetId};
    else if (model.netId)
      return {employer_id: model.netId};
  },
});

/**
 * @class ApplyEmployerRoute
 *
 * General Application Form
 *
 * @namespace App
 * @extends Ember.Route
 */
App.ApplyEmployerRoute = Ember.Route.extend({
  setupController: function(controller, model) {
    controller.set('model', model);

    // Change page name
    document.title = "MyCandidates - " + controller.get('model').name + " - Apply";

    // Change application trail
    this.controllerFor("application").send(
      'updateApplicationTrail', "applyEmployer", controller.get('model'));
  },

  /**
	 * This method returns list of public employer by their id.
	 * @param {String} params
	 * @return {String}
	 */  
  model: function(params) {
    var anEmployer = publicEmployerList.findBy('netId', params.employer_id);
    return anEmployer;//{name: anEmployer.name};
  },

  serialize: function(model) {
    return {employer_id: model.netId};
  }
});
/**
App.CandidateListController = Ember.Controller.extend({
	candidateLists: ["Undecided", "Considered", "Rejected", "Hired"],
	
	selectedList: ""
});

App.CandidateListJobController = Ember.Controller.extend({
	candidateLists: ["Undecided", "Considered", "Rejected", "Hired"],
	
	selectedList: ""
});*/

/**
 * @class EmployerPrivateController
 *
 * Private Employer Page. 
 *
 * @namespace App
 * @extends Ember.Controller
 */
App.EmployerPrivateController = Ember.Controller.extend({
  candidateLists: ["Undecided", "Considered", "Rejected", "Hired"],

  selectedList: "",

  // To keep charts data for redrawing
  chartData: [],

  updateSelectedList: function() {
    for (var i=0; i < this.get('model').jobs.length; ++i) {
      // Change the content of the drop down
      this.get('model').jobs[i].selectedList = "";
    }
  }.observes('model'),

  actions: {
    selectCandidateList: function(jobId) {
      // Transition to Candidate List Employer Page
      if (jobId === undefined && this.selectedList !== null) {        
        this.transitionToRoute('candidateListEmployer', 
          {employerNetId: this.get('model').netId,
            category: this.selectedList.toLowerCase()});
      }
      // Transistion to Candidate List Job Page
      else if (jobId !== undefined) {
        var model = this.get('model');
        aJob = model.jobs.findBy('id', jobId);
        
        if (aJob.selectedList !== null) {
            this.transitionToRoute('candidateListJob', 
            {employerNetId: model.netId,
              jobId: jobId,
              category: aJob.selectedList.toLowerCase()});
        }
      }
    },

	 /**
	 * This method prepares the chart based on the statistics of whether
	 * the candidate is undecided/decided, hired/rejected/
	 *
	 * @param {String} divId
	 */  
    prepareDrawChart: function(divId) {
      var self = this;

      // Check if the API is already loaded
      if (typeof google === "object" && typeof google.visualization === "object")
        this.send('drawChart', divId);
      else
        google.setOnLoadCallback(function(divId){
          self.send('drawChart', divId);
        });      
    },

	 /**
	 * This method draws the chart based on the statistics of whether
	 * the candidate is undecided/decided, hired/rejected.
	 *
	 * @param {String} divId
	 */  	
    drawChart: function(divId) {
      // Check if divId is for job or for total
      var candidateSummary = {undecided: 0, considered: 0, rejected: 0, hired: 0};
      
      if (divId === "chart_divTotal") {
        // Sum all the jobs
        var jobs = this.get('model').jobs;
        for (var i = 0; i < jobs.length; ++i)
          for (var key in candidateSummary)
            candidateSummary[key] += parseInt(jobs[i].candidateSummary[key]);
      }
      else
        candidateSummary = this.get('model').jobs.findBy('id', divId).candidateSummary;

      // Create the data table.
      var data = new google.visualization.DataTable();
      data.addColumn('string', 'NumberOfCandidates');
      data.addColumn('number', 'Total');
      data.addRows([
      ['Undecided', parseInt(candidateSummary.undecided)],
          ['Considered', parseInt(candidateSummary.considered)],
          ['Rejected', parseInt(candidateSummary.rejected)], 
          ['Hired', parseInt(candidateSummary.hired)],          
      ]);

      // Set chart options
      var options = {legend: {position: 'none'}};
   
      // Instantiate and draw our chart, passing in some options.
      var chart = new google.visualization.BarChart(document.getElementById(divId));   
      chart.draw(data, options);

      // Save chart data for redrawing
      var aData = this.get('chartData').findBy('divId', divId);

      if (aData === undefined) {
        this.get('chartData').addObject({divId: divId, data: data});
      }
      else {
        //console.log("update data");
        Ember.set(aData, "data", data);
      }
    },

    redrawChart: function() {
      // Set chart options
      var options = {legend: {position: 'none'}};

      this.get('chartData').forEach(function(item){
        // Instantiate and draw our chart, passing in some options.
        var chart = new google.visualization.BarChart(document.getElementById(item.divId));   
        chart.draw(item.data, options);
      });
    },
  }
}); /*End of EmployerPrivateController.*/

/**
 * @class EmployerPrivateRoute
 *
 * Employer private route page.
 *
 * @namespace App
 * @extends Ember.Route
 */
App.EmployerPrivateRoute = Ember.Route.extend({
  setupController: function(controller, model) {
    if (model.jobs === undefined) {
      //console.log("From link-to or transitionToRoute");
      var result = this.getData(model.netId);
      controller.set('model', result);
    }
    else {
      controller.set('model', model);
    }
    document.title = "MyCandidates - " + controller.get('model').name;

    // Change application trail
    this.controllerFor("application").send(
      'updateApplicationTrail', "employerPrivate", controller.get('model'));
  },

	 /**
	 * This method gets data from the model of employer private.
	 *
	 * @param {String} params
	 * @return {model}
	 */  	  
  model: function(params){
    //console.log("From model of employer private.");
    return this.getData(params.employer_id);
  },

  getData: function(employer_id) {
    return privateEmployerList.findBy('netId', employer_id);
  },

  serialize: function(model) {
    return {employer_id: model.netId};
  }
});

App.AddJobRoute = Ember.Route.extend({
  setupController: function(controller, model) {
    controller.set('model', model);

    // Change page name
    document.title = "MyCandidates - " + controller.get('model').name + " - Add Job";

    // Change application trail
    this.controllerFor("application").send(
      'updateApplicationTrail', "addJob", controller.get('model'));
  },

  /**
   * This method returns an employer by their id.
   * @param {String} params
   * @return {String}
   */  
  model: function(params) {
    var anEmployer = privateEmployerList.findBy('netId', params.employer_id);
    return anEmployer;//{name: anEmployer.name};
  },

  serialize: function(model) {
    return {employer_id: model.netId};
  }
});

/**
 * @class JobPublicRoute
 *
 * . 
 *
 * @namespace App
 * @extends Ember.Route
 */

App.JobPublicRoute = Ember.Route.extend({
  setupController: function(controller, model) {
    if (model.numOfPositions === undefined) {
      //console.log("From link-to");
      var result = this.getData(model.employerNetId, model.id);
      controller.set('model', result);
    }
    else {
      controller.set('model', model);
    }
    document.title = "MyCandidates - " + controller.get('model').employerName +
      " - " + controller.get('model').title;

    // Change application trail
    this.controllerFor("application").send(
      'updateApplicationTrail', "jobPublic", controller.get('model'));
  },

  	 /**
	 * console.log("From model");
	 *
	 * @param {String} params
	 * @return {model}
	 */  	  
  model: function(params){
    return this.getData(params.employer_id, params.job_id);
  },
  /** For #link-to */
  serialize: function(model) {
    return {
      employer_id: model.employerNetId,
      job_id: model.id
    };
  },

  getData: function(employer_id, job_id) {
    return publicJobList.filterBy('employerNetId', employer_id).findBy('id', job_id);
  }
});

/**
 * @class ApplyJobRoute
 *
 * Specific Job Application Routing
 *
 * @namespace App
 * @extends Ember.Route
 */
App.ApplyJobRoute = Ember.Route.extend({
  setupController: function(controller, model) {
    // From public job
    if (model.employerName) {
      controller.set('model', model);
    }
    // From link-to from public employer
    else {
      var result = this.getData(model.employerNetId, model.id);
      controller.set('model', result);
    }
    document.title = "MyCandidates - " + controller.get('model').employerName +
      " - " + controller.get('model').title + " - Apply";

    // Change application trail
    this.controllerFor("application").send(
      'updateApplicationTrail', "applyJob", controller.get('model'));
  },

  model: function(params) {
    return this.getData(params.employer_id, params.job_id);
  },

  getData: function(employer_id, job_id) {
    var aJob = publicJobList.filterBy('employerNetId', employer_id).findBy('id', job_id);
    return aJob; //{employerName: aJob.employerName, id: aJob.id, title: aJob.title};
  },

  serialize: function(model) {
    return {
      employer_id: model.employerNetId,
      job_id: model.id
    };
  }
});

/**
 * @class JobPrivateController
 *
 * Private Job Controller
 *
 * @namespace App
 * @extends Ember.Controller
 */
App.JobPrivateController = Ember.Controller.extend({
  candidateLists: ["Undecided", "Considered", "Rejected", "Hired"],

  selectedList: "",

  // Save chart data
  chartData: null,

  actions: {
    selectCandidateList: function() {
      if (this.selectedList !== null) {
        var model = this.get('model');
        // Transition to Candidate List Page
        this.transitionToRoute('candidateListJob', 
          {employerNetId: model.employerNetId,
            jobId: model.id,
            category: this.selectedList.toLowerCase()});
      }
    },

  	 /**
	 * Prepares chart based on statistics of # of candidates undecided/hired/rejected 
	 *
	 * @param {Integer} divId
	 */  	  	
    prepareDrawChart: function(divId) {
      var self = this;

      // Check if the API is already loaded
      if (typeof google === "object" && typeof google.visualization === "object")
        this.send('drawChart', divId);
      else
        google.setOnLoadCallback(function(divId){
          self.send('drawChart', divId);
        });      
    },

	 /**
	 * Draws chart based on statistics of # of candidates undecided/hired/rejected 
	 *
	 * @param {Integer} divId
	 */
    drawChart: function(divId) {
      // divId is also the job id, which is this job

      var candidateSummary = this.get('model').candidateSummary;
      // Create the data table.
      var data = new google.visualization.DataTable();
      data.addColumn('string', 'NumberOfCandidates');
      data.addColumn('number', 'Total');
      data.addRows([
      ['Undecided', parseInt(candidateSummary.undecided)],
          ['Considered', parseInt(candidateSummary.considered)],
          ['Rejected', parseInt(candidateSummary.rejected)], 
          ['Hired', parseInt(candidateSummary.hired)],          
      ]);

      // Set chart options
      var options = {legend: {position: 'none'}};
   
      // Instantiate and draw our chart, passing in some options.
      var chart = new google.visualization.BarChart(document.getElementById(divId));   
      chart.draw(data, options);

      // Save chart data for redrawing
      this.set('chartData', {divId: divId, data: data});
    },

    redrawChart: function() {
      // Set chart options
      var options = {legend: {position: 'none'}};

      var chart = new google.visualization.BarChart(document.getElementById(this.get('chartData').divId));   
      chart.draw(this.get('chartData').data, options);
    },
  }
});

/**
 * @class JobPrivateRoute
 *
 * JobPrivateRoute
 *
 * @namespace App
 * @extends Ember.Route
 */
App.JobPrivateRoute = Ember.Route.extend({
  setupController: function(controller, model) {
    // If this is from employer:
    if (model.id && model.events === undefined) {
      var result = this.getData(model.employerNetId, model.id);
      controller.set('model', result);
    }
    // If this is from candidate:
    else if (model.jobId) {
      var result = this.getData(model.employerNetId, model.jobId);
      controller.set('model', result);
    }
    else {
      controller.set('model', model);
    }
    document.title = "MyCandidates - Job #" + controller.get('model').id;

    // Change application trail
    this.controllerFor("application").send(
      'updateApplicationTrail', "jobPrivate", controller.get('model'));
  },

  model: function(params){
    return this.getData(params.employer_id, params.job_id);
  },

  /** For #link-to*/
  serialize: function(model) {
    // Check if this is from employer or candidate
    if (model.jobId === undefined) {
      // From Employer
      return {
        employer_id: model.employerNetId,
        job_id: model.id
      };
    }
    else {
      // From candidate
      return {
        employer_id: model.employerNetId,
        job_id: model.jobId
      };
    }
  },

  getData: function(employer_id, job_id) {
    return privateJobList.filterBy('employerNetId', employer_id).findBy('id', job_id);
  }
});

/**
 * @class JobEditRoute
 *
 * Job Edit Route
 *
 * @namespace App
 * @extends Ember.Route
 */
App.JobEditRoute = Ember.Route.extend({
  setupController: function(controller, model) {
    if (model.numOfPositions === undefined) {
      var result = this.getData(model.employerNetId, model.id);
      controller.set('model', result);
    }
    else {
      controller.set('model', model);
    }
    document.title = "MyCandidates - Job #" + controller.get('model').id + " - Edit";

    // Change application trail
    this.controllerFor("application").send(
      'updateApplicationTrail', "jobEdit", controller.get('model'));
  },

  model: function(params){
    return this.getData(params.employer_id, params.job_id);
  },

  serialize: function(model) {
    return {
      employer_id: model.employerNetId,
      job_id: model.id,
    };
  },

  getData: function(employer_id, job_id) {
    return jobInfoList.filterBy('employerNetId', employer_id).findBy('id', job_id);
  }
});

App.CandidateListController = Ember.Controller.extend({
  ratingInput: {
    one: false,
    two: false,
    three: false,
    four: false,
    five: false
  },

  candidateStatus: ["Undecided", "Considered", "Rejected", "Hired"],

  updateSelectedStatus: function() {
    for (var i=0; i < this.get('model').data.length; ++i) {
      // Change the content of the drop down
      Ember.set(this.get('model').data.objectAt(i), "candidateStatusDropdown", this.get('candidateStatus'));

      // Change the selected status based on the status of the model
      // or based on the title of the list <-- this way
      Ember.set(this.get('model').data.objectAt(i), "selectedStatusDropdown", this.get('model').category);
    }
  }.observes('model'),

  initRatingInput: function() {
    this.set('ratingInput', {
      one: false,
      two: false,
      three: false,
      four: false,
      five: false
    });
  },

  setRatingInput: function() {
    for (var i=0; i < this.get('model').data.length; ++i) {
      var rating = Number(this.get('model').data[i].rating);

      this.initRatingInput();

      switch(rating) {
        case 1: this.set('ratingInput.one', true); break;
        case 2: this.set('ratingInput.two', true); break;
        case 3: this.set('ratingInput.three', true); 
        case 4: this.set('ratingInput.four', true); break;
        case 5: this.set('ratingInput.five', true); break;
      };

      // Change the rating input for each candidate
      Ember.set(this.get('model').data.objectAt(i), "ratingInput", this.ratingInput);
      Ember.set(this.get('model').data.objectAt(i), "ratingInputLabel", {
        one: this.get('model').data[i].id + "-1",
        two: this.get('model').data[i].id + "-2",
        three: this.get('model').data[i].id + "-3",
        four: this.get('model').data[i].id + "-4",
        five: this.get('model').data[i].id + "-5",
      });
    }
  }.observes('model'),
});

/**
 * @class CandidateListJobRoute
 *
 * Candidate List Job Route
 *
 * @namespace App
 * @extends Ember.Route
 */
App.CandidateListJobRoute = Ember.Route.extend({
  setupController: function(controller, model) {
    if (model.data === undefined) {
      //console.log("From link-to");
      var result = this.getData(model.employerNetId, model.jobId, model.category);
      controller.set('model', result);
    }
    else {
      controller.set('model', model);
    }

    // Use Candidate List Controller
    this.controllerFor('candidateList').set('model', controller.get('model'));

    document.title = "MyCandidates - Job #" + 
      this.controller.get('model').jobId + " - " +
      this.controller.get('model').category + " Candidates";

    // Change application trail
    this.controllerFor("application").send(
      'updateApplicationTrail', "candidateListJob", controller.get('model'));
  },

  model: function(params) {
    return this.getData(params.employer_id, params.job_id, params.category);
  },

  getData: function(employer_id, job_id, category) {
    // Check category
    if (category.toLowerCase() === 'undecided')
      source = undecidedCandidates;
    else if (category.toLowerCase() === 'rejected')
      source = rejectedCandidates;
    else if (category.toLowerCase() === 'hired')
      source = hiredCandidates;
    else if (category.toLowerCase() === 'considered')
      source = consideredCandidates;
    else
      return {};

    var data = source.filterBy('employerNetId', employer_id).filterBy('jobId', job_id);

    var result = {
      category: category.charAt(0).toUpperCase() + category.slice(1).toLowerCase(),
      data: data,
      employerNetId: employer_id,
      jobId: job_id
    };

    return result;
  },

  serialize: function(model) {
    return {
      employer_id: model.employerNetId,
      job_id: model.jobId,
      category: model.category
    };
  },

  renderTemplate: function() {
    this.render('candidateList');
  }
});

/**
 * @class CandidateListEmployerRoute
 *
 * Routing for Candidate List for Employer
 *
 * @namespace App
 * @extends Ember.Controller
 */
App.CandidateListEmployerRoute = Ember.Route.extend({
  setupController: function(controller, model) {
    if (model.data === undefined) {
      //console.log("From link-to");
      var result = this.getData(model.employerNetId, model.category);
      controller.set('model', result);
    }
    else {
      controller.set('model', model);
    }    

    // Use candidate list controller
    this.controllerFor('candidateList').set('model', controller.get('model'));

    document.title = "MyCandidates - All " + this.controller.get('model').category + " Candidates";

    // Change application trail
    this.controllerFor("application").send(
      'updateApplicationTrail', "candidateListEmployer", controller.get('model'));
  },

  /**
  *Return the data of the model based on employer id and category (undecided/decided/hired/rejected}
  *
  *@param {String} params
  * @return {model}
  */
  model: function(params) {
    return this.getData(params.employer_id, params.category);
  },

  getData: function(employer_id, category) {
    // Check category
    if (category.toLowerCase() === 'undecided')
      source = undecidedCandidates;
    else if (category.toLowerCase() === 'rejected')
      source = rejectedCandidates;
    else if (category.toLowerCase() === 'hired')
      source = hiredCandidates;
    else if (category.toLowerCase() === 'considered')
      source = consideredCandidates;
    else
      return {};

    var data = source.filterBy('employerNetId', employer_id);

    var result = {
      category: category.charAt(0).toUpperCase() + category.slice(1).toLowerCase(),
      data: data,
      employerNetId: employer_id,
    };

    return result;
  },

  serialize: function(model) {
    return {
      employer_id: model.employerNetId,
      category: model.category
    };
  },

  renderTemplate: function() {
    this.render('candidateList');
  }
});

App.CandidateController = Ember.Controller.extend({
  ratingInput: {
    one: false,
    two: false,
    three: false,
    four: false,
    five: false
  },

  candidateStatus: ["Undecided", "Considered", "Rejected", "Hired"],

  selectedStatus: "",

  updateSelectedStatus: function() {
    var status = this.get('model').status;
    this.set('selectedStatus', status.charAt(0).toUpperCase() + status.slice(1).toLowerCase());
  }.observes('model'),

  initRatingInput: function() {
    this.set('ratingInput', {
      one: false,
      two: false,
      three: false,
      four: false,
      five: false
    });
  },

  setRatingInput: function(num) {
    var rating = Number(this.get('model').rating);

    this.initRatingInput();

    switch(rating) {
      case 1: this.set('ratingInput.one', true); break;
      case 2: this.set('ratingInput.two', true); break;
      case 3: this.set('ratingInput.three', true); 
      case 4: this.set('ratingInput.four', true); break;
      case 5: this.set('ratingInput.five', true); break;
    };
  }.observes('model')
});


/**
 * @class CandidateRoute
 *
 * An Individual Candidate
 *
 * @namespace App
 * @extends Ember.Route
 */
App.CandidateRoute = Ember.Route.extend({
  setupController: function(controller, model) {
    if (model.phoneNumber === undefined) {
        // From link-to
        var result = this.getData(model.employerNetId, model.id);
        controller.set('model', result);
    }
    else {
      controller.set('model', model);
    }

    document.title = "MyCandidates - Candidate #" + this.controller.get('model').id;

    // Change application trail
    this.controllerFor("application").send(
      'updateApplicationTrail', "candidate", controller.get('model'));
  },

  model: function(params){
    return this.getData(params.employer_id, params.candidate_id);
  },

  serialize: function(model) {
    return {
      employer_id: model.employerNetId,
      candidate_id: model.id
    };
  },

/**
 *
 * Returns candidate list based on employer's id.
 *
 * @param {Integer, Integer} employer_id, candidate_id
 * @return {list}
 */
  getData: function(employer_id, candidate_id) {
    return candidateList.filterBy('employerNetId', employer_id).findBy('id', candidate_id);
  }
});

// View for chart
App.ChartView = Ember.View.extend({
  // Save the current screen size
  screenWidth: window.innerWidth,

  didInsertElement: function() {
    this.get('controller').send('prepareDrawChart', this.get('content'));

    var self = this;
    self.set('screenWidth', window.innerWidth);

    window.onresize = function() {
      if (self.get('screenWidth') !== window.innerWidth) {
        self.set('screenWidth', window.innerWidth);
        self.get('controller').send('redrawChart');
      }
    };
  },
  willDestroyElement: function() {
    window.onresize = null;
  },
});

// Data Begins
// Candidate Data Begins
// ******************************************************************************************
// ******************************************************************************************
// ******************************************************************************************
// ******************************************************************************************
// ******************************************************************************************
// ******************************************************************************************

undecidedCandidates = [{
  employerNetId: "inc2759",
    jobId: "883700",
    name: "Chase Randol",
    id: "5001",
    rating: "3",
    appliedDate: "11-04-13"
}, {
  employerNetId: "inc2759",
    jobId: "0",
    name: "Katina Jusino",
    id: "5002",
    rating: "4",
    appliedDate: "09-27-13"
}, {
  employerNetId: "com8821",
    jobId: "883708",
    name: "Raymond Handley",
    id: "5003",
    rating: "2",
    appliedDate: "10-28-13"
}, {
  employerNetId: "com8821",
    jobId: "883706",
    name: "Shiela Tinnin",
    id: "5004",
    rating: "1",
    appliedDate: "12-12-12"
}, {
  employerNetId: "inc2759",
    jobId: "883702",
    name: "Erika Ceron",
    id: "5005",
    rating: "5",
    appliedDate: "10-19-13"
}, {
  employerNetId: "com8821",
    jobId: "883701",
    name: "Jamey Brazell",
    id: "5006",
    rating: "3",
    appliedDate: "11-03-13"
}, {
  employerNetId: "inc2759",
    jobId: "883705",
    name: "Douglas Hom",
    id: "5007",
    rating: "3",
    appliedDate: "11-13-13"
}, {
  employerNetId: "com8821",
    jobId: "883704",
    name: "Nadene Hollon",
    id: "5008",
    rating: "3",
    appliedDate: "11-12-13"
}, {
  employerNetId: "com8821",
    jobId: "883700",
    name: "Domenica Spain",
    id: "5009",
    rating: "3",
    appliedDate: "10-13-13"
}, {
  employerNetId: "inc2759",
    jobId: "883703",
    name: "Kourtney Bullins",
    id: "5010",
    rating: "3",
    appliedDate: "09-29-13"
}];


hiredCandidates = [{
  employerNetId: "inc2759",
    jobId: "883700",
    name: "Ashlea Taketa",
    id: "6001",
    rating: "5",
    appliedDate: "10-24-13"
}, {
  employerNetId: "inc2759",
    jobId: "883700",
    name: "Elwood Jefferys",
    id: "6002",
    rating: "4",
    appliedDate: "09-18-12"
}, {
  employerNetId: "com8821",
    jobId: "883708",
    name: "Danilo Timothy",
    id: "6003",
    rating: "3",
    appliedDate: "11-13-13"
}, {
  employerNetId: "com8821",
    jobId: "883706",
    name: "Cordia Icenhour",
    id: "6004",
    rating: "2",
    appliedDate: "11-13-13"
}, {
  employerNetId: "inc2759",
    jobId: "883702",
    name: "Teena Rodney",
    id: "6005",
    rating: "1",
    appliedDate: "09-18-13"
}, {
  employerNetId: "com8821",
    jobId: "883701",
    name: "Silvana Sica",
    id: "6006",
    rating: "3",
    appliedDate: "11-13-13"
}, {
  employerNetId: "inc2759",
    jobId: "883705",
    name: "Kenneth Sheikh",
    id: "6007",
    rating: "3",
    appliedDate: "11-08-13"
}, {
  employerNetId: "com8821",
    jobId: "883704",
    name: "Charlotte Schick",
    id: "6008",
    rating: "3",
    appliedDate: "11-13-13"
}, {
  employerNetId: "com8821",
    jobId: "883700",
    name: "Harriette Fulop",
    id: "6009",
    rating: "3",
    appliedDate: "11-13-13"
}, {
  employerNetId: "inc2759",
    jobId: "883703",
    name: "Willetta Sisk",
    id: "6010",
    rating: "3",
    appliedDate: "10-16-13"
}];

rejectedCandidates = [{
  employerNetId: "inc2759",
    jobId: "0",
    name: "Nakesha Deramus",
    id: "7001",
    rating: "1",
    appliedDate: "11-02-13"
}, {
  employerNetId: "inc2759",
    jobId: "883700",
    name: "Loyd Commons",
    id: "7002",
    rating: "2",
    appliedDate: "10-24-13"
}, {
  employerNetId: "com8821",
    jobId: "883708",
    name: "Heath Goodner",
    id: "7003",
    rating: "3",
    appliedDate: "10-27-13"
}, {
  employerNetId: "com8821",
    jobId: "883706",
    name: "Yvette Galang",
    id: "7004",
    rating: "4",
    appliedDate: "10-16-13"
}, {
  employerNetId: "inc2759",
    jobId: "883702",
    name: "Marvin Scudder",
    id: "7005",
    rating: "5",
    appliedDate: "11-09-13"
}, {
  employerNetId: "com8821",
    jobId: "883701",
    name: "Jaye Flemings",
    id: "7006",
    rating: "4",
    appliedDate: "10-17-13"
}, {
  employerNetId: "inc2759",
    jobId: "883705",
    name: "Dee Neuberger",
    id: "7007",
    rating: "4",
    appliedDate: "11-13-13"
}, {
  employerNetId: "com8821",
    jobId: "883704",
    name: "Charlotte Schick",
    id: "7008",
    rating: "4",
    appliedDate: "08-16-13"
}, {
  employerNetId: "com8821",
    jobId: "883700",
    name: "Lance Clemente",
    id: "7009",
    rating: "4",
    appliedDate: "11-13-13"
}, {
  employerNetId: "inc2759",
    jobId: "883703",
    name: "Suzanna Bochenek",
    id: "7010",
    rating: "4",
    appliedDate: "10-29-13"
}];

consideredCandidates = [{
  employerNetId: "inc2759",
    jobId: "883702",
    name: "Renato Waggener",
    id: "8001",
    rating: "4",
    appliedDate: "10-08-13"
}, {
  employerNetId: "inc2759",
    jobId: "0",
    name: "Victorina Lint",
    id: "8002",
    rating: "3",
    appliedDate: "11-01-13"
}, {
  employerNetId: "com8821",
    jobId: "883708",
    name: "Juliana Martinelli",
    id: "8003",
    rating: "5",
    appliedDate: "11-13-13"
}, {
  employerNetId: "com8821",
    jobId: "883706",
    name: "Dave Folkerts",
    id: "8004",
    rating: "2",
    appliedDate: "11-13-13"
}, {
  employerNetId: "inc2759",
    jobId: "883702",
    name: "Erika Ceron",
    id: "8005",
    rating: "1",
    appliedDate: "11-13-13"
}, {
  employerNetId: "com8821",
    jobId: "883701",
    name: "Jamey Brazell",
    id: "8006",
    rating: "4",
    appliedDate: "11-13-13"
}, {
  employerNetId: "inc2759",
    jobId: "883705",
    name: "Douglas Hom",
    id: "8007",
    rating: "4",
    appliedDate: "11-13-13"
}, {
  employerNetId: "com8821",
    jobId: "883704",
    name: "Nadene Hollon",
    id: "8008",
    rating: "4",
    appliedDate: "11-13-13"
}, {
  employerNetId: "com8821",
    jobId: "883700",
    name: "Maribeth Zhao",
    id: "8009",
    rating: "4",
    appliedDate: "11-13-13"
}, {
  employerNetId: "inc2759",
    jobId: "883703",
    name: "Wendie Gadberry",
    id: "8010",
    rating: "4",
    appliedDate: "11-13-13"
}];

event1 = [{
        createdDate: "11-15-13",
        user: "Beth Wilborn",
        content: "Changed rating from 4 to 3 after interview."
    }, {
      createdDate: "11-10-13",
        user: "Saul O'Neal",
        content: "Rating set to 4 after application review."
  }, {
      createdDate: "07-29-13",
        user: "Saul O'Neal",
        content: "Candidate listed as avaialable for review."
  }, {
      createdDate: "07-11-13",
        user: "Saul O'Neal",
        content: "New candidate listed."
  }];

event2 = [{
        createdDate: "11-15-13",
        user: "Beth Wilborn",
        content: "Interview cancelled, rating and status unchanged."
    }, {
      createdDate: "11-09-13",
        user: "Saul O'Neal",
        content: "Correspondence over phone and interview scheduled for 11/14. Refer to calendar."
  }, {
      createdDate: "11-03-13",
        user: "Saul O'Neal",
        content: "General candidate rating set to 4; considering for possible positions."
  }, {
      createdDate: "07-29-13",
        user: "Saul O'Neal",
        content: "Candidate listed as avaialable for review."
  }, {
      createdDate: "07-11-13",
        user: "Saul O'Neal",
        content: "New candidate listed."
  }];

event3 = [{
        createdDate: "11-13-13",
        user: "Beth Wilborn",
        content: "Candidate hired as of 11/13/13. Refer to hiring manager for records."
    }, {
      createdDate: "11-10-13",
        user: "Beth Wilborn",
        content: "Correspondence over phone and interview scheduled for 11/12/13. Refer to calendar."
  }, {
      createdDate: "11-01-13",
        user: "Saul O'Neal",
        content: "Rating set to 5 after application review."
  }, {
      createdDate: "07-29-13",
        user: "Saul O'Neal",
        content: "Candidate listed as avaialable for review."
  }, {
      createdDate: "07-11-13",
        user: "Saul O'Neal",
        content: "New candidate listed."
  }];

event4 = [{
    createdDate: "11-14-13",
        user: "Beth Wilborn",
        content: "Candidate hired as of 11/14/13. Refer to hiring manager for records."
    }, {
    createdDate: "11-13-13",
        user: "Beth Wilborn",
        content: "Rating set to 4 after interview."
    }, {
        createdDate: "11-12-13",
        user: "Beth Wilborn",
        content: "Correspondence over phone and interview scheduled for 11/12/13. Refer to calendar."
    }, {
      createdDate: "11-10-13",
        user: "Saul O'Neal",
        content: "Ratign set to 3 after application review."
  }, {
      createdDate: "07-29-13",
        user: "Saul O'Neal",
        content: "Candidate listed as avaialable for review."
  }, {
      createdDate: "07-11-13",
        user: "Saul O'Neal",
        content: "New candidate listed."
  }];

event5 = [{
    createdDate: "11-15-13",
        user: "Saul O'Neal",
        content: "Candidate status set to rejected; final status change; application closed."
    }, {
        createdDate: "11-15-13",
        user: "Saul O'Neal",
        content: "Rating set to 1 after further review."
    }, {
      createdDate: "11-03-13",
        user: "Saul O'Neal",
        content: "Rating set to 2 after application review."
  }, {
      createdDate: "07-29-13",
        user: "Saul O'Neal",
        content: "Candidate listed as avaialable for review."
  }, {
      createdDate: "07-11-13",
        user: "Saul O'Neal",
        content: "New candidate listed."
  }];

event6 = [{
        createdDate: "11-11-13",
        user: "Beth Wilborn",
        content: "Candidate status set to rejected; final status change; application closed."
    }, {
      createdDate: "11-09-13",
        user: "Saul O'Neal",
        content: "Rating set to 2 after interview."
  }, {
      createdDate: "11-01-13",
        user: "Saul O'Neal",
        content: "Interview scheduled for 11/08/13. Refer to calendar. Candidate status changed to considered."
  }, {
      createdDate: "10-28-13",
        user: "Beth Wilborn",
        content: "Rating set to 3 after application review."
  }, {
      createdDate: "07-29-13",
        user: "Saul O'Neal",
        content: "Candidate listed as avaialable for review."
  }, {
      createdDate: "07-11-13",
        user: "Saul O'Neal",
        content: "New candidate listed."
  }];

event7 = [{
      createdDate: "10-12-13",
        user: "Saul O'Neal",
        content: "Rating set to 4 after further application review."
  }, {
        createdDate: "10-13-13",
        user: "Beth Wilborn",
        content: "Candidate added to hotlist."
    }, {
      createdDate: "10-12-13",
        user: "Beth Wilborn",
        content: "Attempted correspondence by phone; left voice mail."
  }, {
      createdDate: "10-10-13",
        user: "Saul O'Neal",
        content: "Rating set to 3 after application review."
  }, {
      createdDate: "07-29-13",
        user: "Saul O'Neal",
        content: "Candidate listed as avaialable for review."
  }, {
      createdDate: "07-11-13",
        user: "Saul O'Neal",
        content: "New candidate listed."
  }];

event8 = [{
      createdDate: "11-11-13",
        user: "Saul O'Neal",
        content: "Rating set to 3 after further application review."
  }, {
        createdDate: "11-09-13",
        user: "Beth Wilborn",
        content: "Candidate added to hotlist."
    }, {
      createdDate: "11-05-13",
        user: "Beth Wilborn",
        content: "Attempted correspondence by phone; left voice mail."
  }, {
      createdDate: "11-03-13",
        user: "Saul O'Neal",
        content: "Rating set to 4 after application review."
  }, {
      createdDate: "07-29-13",
        user: "Saul O'Neal",
        content: "Candidate listed as avaialable for review."
  }, {
      createdDate: "07-11-13",
        user: "Saul O'Neal",
        content: "New candidate listed."
  }];

candidateList = [{ //Undecided candidate 1
    employerNetId: "inc2759",
    jobId: "883700",
    id: "5001",
    name: "Chase Randol",
    position: "Plumber",
    rating: "3",
	status: "Undecided",
    phoneNumber: "972-946-5630",
    emailAddress: "chase.randol@email.com",
    appliedDate: "11-04-13",
    assignedTo: "Beth Wilborn",
    events: event1,
}, { //Undecided candidate 2
    employerNetId: "inc2759",
    jobId: "0",
    id: "5002",
    name: "Katina Jusino",
    position: "General",
    rating: "4",
	status: "Undecided",
    phoneNumber: "972-476-2957",
    emailAddress: "katina.jusino@email.com",
    appliedDate: "09-27-13",
    assignedTo: "Saul O'Neal",
    events: event2,
}, { // Hired candidate 1
    employerNetId: "inc2759",
    jobId: "883700",
    id: "6001",
    name: "Ashlea Taketa",
    position: "Plumber",
    rating: "5",
	status: "Hired",
    phoneNumber: "214-376-2957",
    emailAddress: "ashlea.taketa@email.com",
    appliedDate: "10-24-13",
    assignedTo: "Beth Wilborn",
    events: event3,
}, { // Hired candidate 2
    employerNetId: "inc2759",
    jobId: "883700",
    id: "6002",
    name: "Elwood Jefferys",
    position: "Plumber",
    rating: "4",
	status: "Hired",
    phoneNumber: "416-572-5825",
    emailAddress: "elwood.jefferys@email.com",
    appliedDate: "09-18-13",
    assignedTo: "Beth Wilborn",
    events: event4,
}, { // Rejected candidate 1
    employerNetId: "inc2759",
    jobId: "0",
    id: "7001",
    name: "Nakesha Deramus",
    position: "General",
    rating: "1",
	status: "Rejected",
    phoneNumber: "972-587-3862",
    emailAddress: "nakesha.deramus@email.com",
    appliedDate: "11-02-13",
    assignedTo: "Saul O'Neal",
    events: event5,
}, { // Rejected candidate 2
    employerNetId: "inc2759",
    jobId: "883700",
    id: "7002",
    name: "Loyd Commons",
    position: "Plumber",
    rating: "2",
	status: "Rejected",
    phoneNumber: "972-503-3863",
    emailAddress: "loyd.commons@email.com",
    appliedDate: "10-24-13",
    assignedTo: "Beth Wilborn",
    events: event6,
}, { // Considered candidate 1
    employerNetId: "inc2759",
    jobId: "883702",
    id: "8001",
    name: "Renato Waggener",
    position: "Teacher",
    rating: "4",
	status: "Considered",
    phoneNumber: "214-947-1057",
    emailAddress: "renato.waggener@email.com",
    appliedDate: "10-08-13",
    assignedTo: "Saul O'Neal",
    events: event7,
}, { // Considered candidate 2
    employerNetId: "inc2759",
    jobId: "0",
    id: "8002",
    name: "Chase Randol",
    position: "Victorina Lint",
    rating: "3",
	status: "Considered",
    phoneNumber: "972-385-2856",
    emailAddress: "victorina.lint@email.com",
    appliedDate: "11-01-13",
    assignedTo: "Saul O'Neal",
    events: event8
}];

// Job Begins
// ******************************************************************************************
// ******************************************************************************************
// ******************************************************************************************
// ******************************************************************************************
// ******************************************************************************************
// ******************************************************************************************

publicJobList = [{ //JOB 1 OF EMPLOYER 1
    employerNetId: "inc2759",
    id: "883700",
    employerName: "Roto Rooter",
    title: "Plumber",
    description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
    numOfPositions: "2",
    experienceReq: "1+ years",
    educationReq: "High school diploma",
    salaryMin: "20,000",
    salaryMax: "30,000",
    otherReq: "none",
    sectors: "Maintenance & Repair",
    location:{
        country: "US",
        city: "Dallas",
        state: "TX",
        postalCode: "75524"
    }
}, { //JOB 2 OF EMPLOYER 1
    employerNetId: "inc2759",
    id: "883701",
    employerName: "Roto Rooter",
    title: "Plumber",
    description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
    numOfPositions: "2",
    experienceReq: "2+ years",
    educationReq: "High school diploma",
    salaryMin: "20,000",
    salaryMax: "25,000",
    otherReq: "none",
    sectors: "Maintenance & Repair",
    location:{
        country: "US",
        city: "Plano",
        state: "TX",
        postalCode: "75032"
    }
}, { //JOB 1 OF EMPLOYER 2
    employerNetId: "com8821",
    id: "946500",
    employerName: "Market, Inc.",
    title: "Delivery driver",
    description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
    numOfPositions: "2",
    experienceReq: "None",
    educationReq: "High school diploma",
    salaryMin: "10,000",
    salaryMax: "15,000",
    otherReq: "Driver's license",
    sectors: "Hospitality",
    location:{
        country: "US",
        city: "Richardson",
        state: "TX",
        postalCode: "75081"
    }
}, { //JOB 2 OF EMPLOYER 2
    employerNetId: "com8821",
    id: "946501",
    employerName: "Market, Inc.",
    title: "Teacher",
    description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
    numOfPositions: "1",
    experienceReq: "2+ years",
    educationReq: "Bachelor's degree",
    salaryMin: "35,000",
    salaryMax: "40,000",
    otherReq: "None",
    sectors: "Education",
    location:{
        country: "US",
        city: "Allen",
        state: "TX",
        postalCode: "75003"
    }
}];


privateJobList = [{ //JOB 1 OF EMPLOYER 1
    employerNetId: "inc2759",
    id: "883700",
    title: "Plumber",
    state: "TX",
    description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
    salaryMin: "20,000",
    salaryMax: "30,000",
    candidateSummary:{
        viewed: "3863",
        undecided: "31",
        considered: "12",
        rejected: "8",
        hired: "0"
    },
  jobDistributions:[{
    jobBoard: "Indeed",
    addedDate: "11-13-13",
    viewed: "362",
    numOfApplication: "12"
  }, {
    jobBoard: "Monster",
    addedDate: "11-14-13",
    viewed: "673",
    numOfApplication: "38"
  }],
  events:[{
    createdDate: "11-13-13",
    user: "Saul O'Neal",
    content: "Hired for one position; one position remaining."
  }, {
    createdDate: "11-12-13",
    user: "Saul O'Neal",
    content: "Reviewed all currently unreviewed applications."
  }, {
    createdDate: "11-02-13",
    user: "Saul O'Neal",
    content: "Reviewed all currently unreviewed applications."
  }, {
    createdDate: "10-27-13",
    user: "Saul O'Neal",
    content: "Sent job listing to Indeed and Monster."
  }, {
    createdDate: "10-14-13",
    user: "Saul O'Neal",
    content: "New job posted."
  }]
}, { //JOB 2 OF EMPLOYER 1
    employerNetId: "inc2759",
    id: "883701",
    title: "Electrician",
    state: "TX",
    description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
    salaryMin: "20,000",
    salaryMax: "25,000",
    candidateSummary:{
        viewed: "3569",
        undecided: "24",
        considered: "4",
        rejected: "7",
        hired: "2"
    },
  jobDistributions:[{
    jobBoard: "Indeed",
    addedDate: "11-13-13",
    viewed: "362",
    numOfApplication: "12"
  }, {
    jobBoard: "Monster",
    addedDate: "11-14-13",
    viewed: "673",
    numOfApplication: "38"
  }],
  events:[{
    createdDate: "11-11-13",
    user: "Saul O'Neal",
    content: "Hired for one position; job posting closed."
  }, {
    createdDate: "11-09-13",
    user: "Saul O'Neal",
    content: "Reviewed all currently unreviewed applications."
  }, {
    createdDate: "11-02-13",
    user: "Saul O'Neal",
    content: "Reviewed all currently unreviewed applications."
  }, {
    createdDate: "10-31-13",
    user: "Saul O'Neal",
    content: "Sent job listing to Indeed and Monster."
  }, {
    createdDate: "10-28-13",
    user: "Saul O'Neal",
    content: "New job posted."
  }]
}, { //JOB 1 OF EMPLOYER 2
    employerNetId: "com8821",
    id: "946500",
    title: "Delivery driver",
    state: "TX",
    description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
    salaryMin: "10,000",
    salaryMax: "15,000",
    candidateSummary:{
        viewed: "3468",
        undecided: "53",
        considered: "46",
        rejected: "2",
        hired: "1"
    },
  jobDistributions:[{
    jobBoard: "Indeed",
    addedDate: "11-13-13",
    viewed: "362",
    numOfApplication: "12"
  }, {
    jobBoard: "Monster",
    addedDate: "11-14-13",
    viewed: "346",
    numOfApplication: "47"
  }],
  events:[{
    createdDate: "11-13-13",
    user: "Chris Brown",
    content: "Hired for one position; one position remaining."
  }, {
    createdDate: "11-12-13",
    user: "Chris Brown",
    content: "Reviewed all currently unreviewed applications."
  }, {
    createdDate: "11-02-13",
    user: "Chris Brown",
    content: "Reviewed all currently unreviewed applications."
  }, {
    createdDate: "10-27-13",
    user: "Chris Brownl",
    content: "Sent job listing to Indeed and Monster."
  }, {
    createdDate: "10-14-13",
    user: "Chris Brown",
    content: "New job posted."
  }],
}, { //JOB 2 OF EMPLOYER 2
    employerNetId: "com8821",
    id: "946501",
    title: "Teacher",
    state: "TX",
    description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
    salaryMin: "35,000",
    salaryMax: "40,000",
    candidateSummary:{
        viewed: "2479",
        undecided: "25",
        considered: "4",
        rejected: "15",
        hired: "0"
    },
  jobDistributions:[{
    jobBoard: "Indeed",
    addedDate: "11-13-13",
    viewed: "468",
    numOfApplication: "24"
  }, {
    jobBoard: "Monster",
    addedDate: "11-14-13",
    viewed: "680",
    numOfApplication: "47"
  }],
  events:[{
    createdDate: "11-13-13",
    user: "Chris Brown",
    content: "Hired for one position; job posting closed."
  }, {
    createdDate: "11-12-13",
    user: "Chris Brown",
    content: "Reviewed all currently unreviewed applications."
  }, {
    createdDate: "11-02-13",
    user: "Chris Brown",
    content: "Reviewed all currently unreviewed applications."
  }, {
    createdDate: "10-27-13",
    user: "Chris Brown",
    content: "Sent job listing to Indeed and Monster."
  }, {
    createdDate: "10-14-13",
    user: "Chris Brown",
    content: "New job posted."
  }]
}];

// Job Info Begins
// ******************************************************************************************
// ******************************************************************************************
// ******************************************************************************************
// ******************************************************************************************
// ******************************************************************************************
// ******************************************************************************************

jobInfoList = [{ //JOB 1 OF EMPLOYER 1
    employerNetId: "inc2759",
    id: "883700",
    title: "Plumber",
    description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
    numOfPositions: "2",
    experienceReq: "1+ years",
    educationReq: "High school diploma",
    salaryMin: "20,000",
    salaryMax: "30,000",
    otherReq: "none",
    sectors: "Maintenance & Repair",
    location:{
        country: "US",
        city: "Dallas",
        state: "TX",
        postalCode: "75524"
    }
}, { //JOB 2 OF EMPLOYER 1
    employerNetId: "inc2759",
    id: "883701",
    title: "Electrician",
    description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
    numOfPositions: "2",
    experienceReq: "2+ years",
    educationReq: "High school diploma",
    salaryMin: "20,000",
    salaryMax: "25,000",
    otherReq: "none",
    sectors: "Maintenance & Repair",
    location:{
        country: "US",
        city: "Plano",
        state: "TX",
        postalCode: "75032"
    }
}, { //JOB 1 OF EMPLOYER 2
    employerNetId: "com8821",
    id: "946500",
    title: "Delivery driver",
    description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
    numOfPositions: "2",
    experienceReq: "None",
    educationReq: "High school diploma",
    salaryMin: "10,000",
    salaryMax: "15,000",
    otherReq: "Driver's license",
    sectors: "Hospitality",
    location:{
        country: "US",
        city: "Richardson",
        state: "TX",
        postalCode: "75081"
    }
}, { //JOB 2 OF EMPLOYER 2
    employerNetId: "com8821",
    id: "946501",
    title: "Teacher",
    description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
    numOfPositions: "1",
    experienceReq: "2+ years",
    educationReq: "Bachelor's degree",
    salaryMin: "35,000",
    salaryMax: "40,000",
    otherReq: "None",
    sectors: "Education",
    location:{
        country: "US",
        city: "Allen",
        state: "TX",
        postalCode: "75003"
    }
}];

// Employer Begins
// ******************************************************************************************
// ******************************************************************************************
// ******************************************************************************************
// ******************************************************************************************
// ******************************************************************************************
// ******************************************************************************************

publicJob1 = [{
        id: "883700",
        employerNetId: "inc2759",
        title: "Plumber",
        location: "Dallas, TX",
        description: "Lorem Ipsum is simply dummy text of the...",
        datePosted: "11-12-13"
  }, {
      id: "883701",
        employerNetId: "inc2759",
        title: "Plumber",
        description: "Lorem Ipsum is simply dummy text of the...",
        location: "Plano, TX",
        datePosted: "11-09-13"
    }, {
      id: "883702",
        employerNetId: "inc2759",
        title: "Plumber",
        description: "Lorem Ipsum is simply dummy text of the...",
        location: "Allen, TX",
        datePosted: "10-18-13"
  }, {
      id: "883703",
        employerNetId: "inc2759",
        title: "Manager",
        description: "This is a waiter job for people with...",
        location: "Austin, TX",
        datePosted: "09-18-13"
  },{
      id: "883704",
        employerNetId: "inc2759",
        title: "Manager",
        description: "Lorem Ipsum is simply dummy text of the...",
        location: "Dallas, TX",
        datePosted: "11-16-13"
  }, {
      id: "883705",
        employerNetId: "inc2759",
        title: "Dispatcher",
        description: "Lorem Ipsum is simply dummy text of the...",
        location: "Richardson, TX",
        datePosted: "10-06-13"
  }, {
      id: "883706",
        employerNetId: "inc2759",
        title: "Customer Service",
        description: "Lorem Ipsum is simply dummy text of the...",
        location: "Plano, TX",
        datePosted: "08-28-13"
  }, {
      id: "883707",
        employerNetId: "inc2759",
        title: "Dispatcher",
        description: "Lorem Ipsum is simply dummy text of the...",
        location: "Los Angeles, CA",
        datePosted: "11-11-13"
  }, {
      id: "883708",
        employerNetId: "inc2759",
        title: "Sales Representative",
        description: "Lorem Ipsum is simply dummy text of the...",
        location: "New York, NY",
        datePosted: "09-18-13"
  }, {
      id: "883709",
        employerNetId: "inc2759",
        title: "Administrator",
        description: "Lorem Ipsum is simply dummy text of the...",
        location: "Tampa, FL",
        datePosted: "10-15-13"
  }];
  
publicJob2 = [{
        id: "946500",
        employerNetId: "com8821",
        title: "Delivery driver",
        description: "Lorem Ipsum is simply dummy text of the...",
        location: "Richardson, TX",
        datePosted: "11-12-13"
    }, {
      id: "946501",
        employerNetId: "com8821",
        title: "Teacher",
        description: "Lorem Ipsum is simply dummy text of the...",
        location: "Allen, TX",
        datePosted: "11-11-13"
    }, {
        id: "946502",
        employerNetId: "com8821",
        title: "Electrician",
        description: "Lorem Ipsum is simply dummy text of the...",
        location: "Plano, TX",
        datePosted: "11-09-13"
  }, {
      id: "946503",
        employerNetId: "com8821",
        title: "Waiter",
        description: "Lorem Ipsum is simply dummy text of the...",
        location: "Austin, TX",
        datePosted: "12-01-13"
  }, {
      id: "946504",
        employerNetId: "com8821",
        title: "A/C Repairman",
        description: "Lorem Ipsum is simply dummy text of the...",
        location: "Dallas, TX",
        datePosted: "10-22-13"
  }, {
      id: "946505",
        employerNetId: "com8821",
        title: "Sales representative",
        description: "Lorem Ipsum is simply dummy text of the...",
        location: "Richardson, TX",
        datePosted: "10-06-13"
  }, {
      id: "946506",
        employerNetId: "com8821",
        title: "Front office",
        description: "Lorem Ipsum is simply dummy text of the...",
        location: "Austin, TX",
        datePosted: "08-28-13"
  }, {
      id: "946507",
        employerNetId: "com8821",
        title: "Waiter",
        description: "Lorem Ipsum is simply dummy text of the...",
        location: "Los Angeles, CA",
        datePosted: "09-16-13"
  }, {
      id: "946508",
        employerNetId: "com8821",
        title: "Janitor",
        description: "Lorem Ipsum is simply dummy text of the...",
        location: "Chicago, IL",
        datePosted: "11-09-13"
  }, {
      id: "946509",
        employerNetId: "com8821",
        title: "Teacher",
        description: "Lorem Ipsum is simply dummy text of the...",
        location: "Houston, FL",
        datePosted: "10-11-13"
  }];
  
  
privateJob1 = [{
        id: "883700",
    employerNetId: "inc2759",
        title: "Plumber",
        location: "Dallas, TX",
    candidateSummary:{
            viewed: "3863",
            undecided: "31",
            considered: "12",
            rejected: "8",
            hired: "0"
        }
  }, {
      id: "883701",
    employerNetId: "inc2759",
        title: "Electrician",
        location: "Plano, TX",
    candidateSummary:{
            viewed: "3569",
            undecided: "24",
            considered: "4",
            rejected: "7",
            hired: "2"
        }
    }, {
      id: "883702",
    employerNetId: "inc2759",
        title: "Teacher",
        location: "Allen, TX",
    candidateSummary:{
            viewed: "548",
            undecided: "12",
            considered: "3",
            rejected: "8",
            hired: "0"
        }
  }, {
      id: "883703",
    employerNetId: "inc2759",
        title: "Waiter",
        location: "Austin, TX",
    candidateSummary:{
            viewed: "8663",
            undecided: "56",
            considered: "12",
            rejected: "23",
            hired: "1"
        }
  }, {
      id: "883704",
    employerNetId: "inc2759",
        title: "A/C Repairman",
        location: "Dallas, TX",
    candidateSummary:{
            viewed: "285",
            undecided: "12",
            considered: "19",
            rejected: "4",
            hired: "1"
        }
  }, {
      id: "883705",
    employerNetId: "inc2759",
        title: "Delivery Driver",
        location: "Richardson, TX",
    candidateSummary:{
            viewed: "866",
            undecided: "24",
            considered: "18",
            rejected: "3",
            hired: "2"
        }
  }, {
      id: "883706",
    employerNetId: "inc2759",
        title: "Plumber",
        location: "Plano, TX",
    candidateSummary:{
            viewed: "3467",
            undecided: "35",
            considered: "24",
            rejected: "8",
            hired: "1"
        }
  }, {
      id: "883707",
    employerNetId: "inc2759",
        title: "Waiter",
        location: "Los Angeles, CA",
    candidateSummary:{
            viewed: "9773",
            undecided: "356",
            considered: "88",
            rejected: "79",
            hired: "5"
        }
  }, {
      id: "883708",
    employerNetId: "inc2759",
        title: "Janitor",
        location: "New York, NY",
    candidateSummary:{
            viewed: "4439",
            undecided: "85",
            considered: "17",
            rejected: "29",
            hired: "3"
        }
  }, {
      id: "883709",
    employerNetId: "inc2759",
        title: "Teacher",
        location: "Tampa, FL",
    candidateSummary:{
            viewed: "6836",
            undecided: "19",
            considered: "32",
            rejected: "14",
            hired: "2"
        }
  }];

event1 = [{
    createdDate: "11-02-13",
    user: "Saul O'Neal",
    content: "Organized events in calendar."
  }, {
    createdDate: "10-29-13",
    user: "Saul O'Neal",
    content: "Added job board MyOpenJobs to job listing options."
  }, {
    createdDate: "10-22-13",
    user: "Saul O'Neal",
    content: "Testing new format for job postings."
  }, {
    createdDate: "10-18-13",
    user: "Saul O'Neal",
    content: "Posted new job listing ID 883703."
  }, {
    createdDate: "09-23-13",
    user: "Saul O'Neal",
    content: "Added new user, Emily Wikinson."
  },{
    createdDate: "11-02-13",
    user: "Saul O'Neal",
    content: "Organized events in calendar."
  }, {
    createdDate: "10-29-13",
    user: "Saul O'Neal",
    content: "Added job board MyOpenJobs to job listing options."
  }, {
    createdDate: "10-22-13",
    user: "Saul O'Neal",
    content: "Testing new format for job postings."
  }, {
    createdDate: "10-18-13",
    user: "Saul O'Neal",
    content: "Posted new job listing ID 883703."
  }, {
    createdDate: "09-23-13",
    user: "Saul O'Neal",
    content: "Added new user, Emily Wikinson."
  }];

privateJob2 = [{
        id: "946500",
    employerNetId: "com8821",
        title: "Delivery driver",
        location: "Richardson, TX",
    candidateSummary:{
            viewed: "3468",
            undecided: "53",
            considered: "46",
            rejected: "2",
            hired: "1"
        }
    }, {
      id: "946501",
    employerNetId: "com8821",
        title: "Teacher",
        location: "Allen, TX",
    candidateSummary:{
            viewed: "2479",
            undecided: "25",
            considered: "4",
            rejected: "15",
            hired: "0"
        }
    }, {
        id: "946502",
    employerNetId: "com8821",
        title: "Electrician",
        location: "Plano, TX",
        candidateSummary:{
            viewed: "3569",
            undecided: "24",
            considered: "4",
            rejected: "7",
            hired: "2"
        }
  }, {
      id: "946503",
    employerNetId: "com8821",
        title: "Waiter",
        location: "Austin, TX",
    candidateSummary:{
            viewed: "8663",
            undecided: "56",
            considered: "12",
            rejected: "23",
            hired: "1"
        }
  }, {
      id: "946504",
    employerNetId: "com8821",
        title: "A/C Repairman",
        location: "Fort Worth, TX",
    candidateSummary:{
            viewed: "285",
            undecided: "12",
            considered: "19",
            rejected: "4",
            hired: "1"
        }
  }, {
      id: "946505",
    employerNetId: "com8821",
        title: "Sales representative",
        location: "Richardson, TX",
    candidateSummary:{
            viewed: "866",
            undecided: "24",
            considered: "18",
            rejected: "3",
            hired: "2"
        }
  }, {
      id: "946506",
    employerNetId: "com8821",
        title: "Front office",
        location: "Austin, TX",
    candidateSummary:{
            viewed: "3573",
            undecided: "93",
            considered: "36",
            rejected: "8",
            hired: "1"
        }
  }, {
      id: "946507",
    employerNetId: "com8821",
        title: "Waiter",
        location: "Los Angeles, CA",
    candidateSummary:{
            viewed: "9773",
            undecided: "356",
            considered: "88",
            rejected: "79",
            hired: "5"
        }
  }, {
      id: "946508",
    employerNetId: "com8821",
        title: "Janitor",
        location: "Chicago, IL",
    candidateSummary:{
            viewed: "4439",
            undecided: "85",
            considered: "17",
            rejected: "29",
            hired: "3"
        }
  }, {
      id: "946509",
    employerNetId: "com8821",
        title: "Teacher",
        location: "Houston, TX",
    candidateSummary:{
            viewed: "6836",
            undecided: "19",
            considered: "32",
            rejected: "14",
            hired: "2"
        }
  }];
  
event2 = [{
    createdDate: "09-28-13",
    user: "Chris Brown",
    content: "Posted new job listing ID 946501."
  }, {
    createdDate: "08-19-13",
    user: "Chris Brown",
    content: "Added new user, Beth Evans."
  }];

publicEmployerList = [{ //EMPLOYER 1
    netId: "inc2759",
    name: "Roto Rooter",
    address1: "8563 Denham Dr.",
	address2: "",
	city: "Dallas",
	state: "TX",
	postalCode: "75524",
    website: "http://www.rotorooter.com/",
    email: "apply@rotorooter.com",
    phone: "1-800-946-2946",
    jobs: publicJob1,
}, { //EMPLOYER 2
    netId: "com8821",
    name: "Market, Inc.",
    address1: "5409 Willow Ln.",
	address2: "",
	city: " Richardson",
	state: "TX",
	postalCode: "75081",
    website: "http://www.marketinc.com/",
    email: "apply@marketinc.com",
    phone: "214-567-2301",
    jobs: publicJob2
}]; 

privateEmployerList = [{ //EMPLOYER 1
    netId: "inc2759",
    name: "Roto Rooter",
    address1: "8563 Denham Dr.",
	address2: "",
	city: "Dallas",
	state: "TX",
	postalCode: "75524",
    website: "http://www.rotorooter.com/",
    email: "apply@rotorooter.com",
    phone: "1-800-946-2946",
    jobs: privateJob1,
  events: event1,
}, { //EMPLOYER 2
    netId: "com8821",
    name: "Market, Inc.",
    address1: "5409 Willow Ln.",
	address2: "",
	city: " Richardson",
	state: "TX",
	postalCode: "75081",
    website: "http://www.marketinc.com/",
    email: "apply@marketinc.com",
    phone: "214-567-2301",
    jobs: privateJob2,
  events: event2
}];

// End Data
// ******************************************************************************************
// ******************************************************************************************
// ******************************************************************************************
// ******************************************************************************************
// ******************************************************************************************
// ******************************************************************************************