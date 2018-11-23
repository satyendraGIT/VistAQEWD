 
sessions = require('../ewd-session');
var runRPC = require('../ewd-qoper8-vistarpc/lib/proto/runRPC.js');
const DocumentStore = require('../ewd-document-store');
var router = require('qewd-router');
const assert = require('assert');
var routes;

function login(args, finished) {
      
var accessCode = args.req.headers.accesscode;
      var verifyCode = args.req.headers.verifycode;
      if (accessCode === '') {
        finished({error: 'You must enter an access code'});
        return;
      }
     if (verifyCode === '') {
        finished({error: 'You must enter a verify code'});
        return;
      }
        var session = this.sessions.create('vistaQEWD',3600);
let respSIGNON = runRPC.call(this, {rpcName: 'XUS SIGNON SETUP'}, session, false);
      params = {
        rpcName: 'XUS AV CODE',
        rpcArgs: [{
          type: 'LITERAL',
          value: accessCode + ';' + verifyCode
        }],
      };
      var response = runRPC.call(this, params, session, false);
      var values = response.value;
      var duz = values[0];
      var err = values[3];
      if (duz.toString() === '0' && err !== '') {
        finished({error: err});
      }
     else {
session.authenticated = true;
session.data.$('duz').value = duz;

        var greeting = values[7];
        var pieces = greeting.split(' ');
        pieces = pieces.splice(2, pieces.length);
        var displayName = pieces.join(' ');
  this.db.symbolTable.save(session);
this.db.symbolTable.setVar('XWBTIP', session.ipAddress);

var isLogOnProhibited  = parseInt(this.db.function({function: 'INHIB1^XUSRB'}).result);
var isMaxUsersOnSystem = parseInt(this.db.function({function: 'INHIB2^XUSRB'}).result); 
this.db.symbolTable.setVar('XWBCLMAN', this.db.version());

 this.db.symbolTable.save(session);
// setup the XUS DIVISION 

let resDIV = true;
      let divisions = runRPC.call(this, {rpcName: 'XUS DIVISION GET'}, session).value;
      console.log('division get response: ' + JSON.stringify(divisions));
divisions.splice(0,1); // Remove array length element
      divisions.forEach(function(element, index, array) { // Keep only IENs
        array[index] = element.split('^')[0];
      });
      if (divisions.length > 1) {
        params = {
          rpcName: 'XUS DIVISION SET',
          rpcArgs: [{
            type: 'LITERAL',
            value: '`' + divisions[0]
          }]
        };
        resDIV = runRPC.call(this, params, session);

      }
//Setup of context
let para = {
        rpcName: 'XWB CREATE CONTEXT',
        rpcArgs: [{
          type: 'LITERAL',
          value: 'OR CPRS GUI CHART'
        }]
      };
      let resCONT = runRPC.call(this, para, session);
 
// setup the user data
let data = runRPC.call(this, {rpcName: 'XUS GET USER INFO'}, session);
        var results = {
          success: session.authenticated,
          duz:duz,
          token: session.token,
          displayName: displayName,
          greeting: greeting,
          lastSignon: values[8],
          messages: values.splice(8, values.length),
        };
        finished(results);
      }
}

//get the patient demo details
function getPatientDemo(args, finished) {
  var patientid = args.req.headers.patientid;
  var duz = args.session.data.$('duz').value;
  var session = args.session;
  params = {
    rpcName: 'ORWPT SELECT',
    rpcArgs: [{
      type: 'LITERAL',
      value: patientid
    }],
    context:  "OR CPRS GUI CHART",
    duz: duz
   };
  var response = runRPC.call(this, params, session, true);
  //{"type":"SINGLE VALUE","value":["CARTER,DAVID","M","2591003","543236666","","","","","0","","0","0","","","58","0"]}
  console.log('login response: ' + JSON.stringify(response));
  var values = response.value;
  var results = {
         PatientName: values[0],
         Sex: values[1],
         Dob: values[2],
 SSN: values[3],
 Age: values[14]
   };
   finished(results);
}

//add the Allergies for a patient
function addAllergies(args, finished) {
  console.log('getPatient ID: ' + args.req.body.VistaServiceRequests.PatientId);
 var session = args.session;
 var U="^";
 var bodyObj = args.req.body.VistaServiceRequests;
 var detObj = bodyObj["UpdateDetails"];
 var reqObj = detObj.Request;
 var vistaSerObj = reqObj.VistaServiceRequest;
 var vistaDataObj = vistaSerObj.RequestData;
 var reqFac = vistaSerObj["RequestFacility"];
 var allIEN = vistaDataObj["IEN"];
 var reqDT = vistaDataObj["eventDateTime"];
 var allName = vistaDataObj["allergyName"];
 var nReaction = vistaDataObj["natureOfReaction"];
 var histObs = vistaDataObj["historicalOrObserved"];
 var obsDate = vistaDataObj["RequestData.ObservedDate"];
 var comment = vistaDataObj["comment"];
 var severity = vistaDataObj["severity"];
 var symptIEN = vistaDataObj["symptoms"][0].IEN;
 var symptName = vistaDataObj["symptoms"][0].name;
 var patientid = vistaDataObj["PatientID"];
 var DUZ = vistaDataObj["enteredBy"];
 
 let result = {};
 this.db.symbolTable.restore(session);
 this.db.symbolTable.setVar('U',U);
 this.db.symbolTable.setVar('DUZ',DUZ);
 this.db.symbolTable.setVar('SK','SATYENDRA KUMAR SINGH');
 let nowFM = this.db.function({function: 'NOW^XLFDT'}).result;
 this.db.symbolTable.killVar('GMRAIEN');
 let g = this.db.use('TMP', 'GMRA', process.pid);
 g.delete();
 console.log(' process.pid :' + process.pid);
 let pid =  process.pid;
 if (allIEN) this.db.symbolTable.setVar('GMRAIEN', allIEN);
  else          this.db.symbolTable.setVar('GMRAIEN', 0);
 console.log('GMRAIEN ' + this.db.symbolTable.getVar('GMRAIEN'));
  g.$('GMRAGNT').value = allName + '^' + allIEN + ';' + "GMRD(120.82" + ',';
  g.$('GMRANATR').value = nReaction;
  g.$('GMRAORIG').value = DUZ;
  g.$('GMRAORDT').value = nowFM;
  g.$('GMRASYMP').$(0).value = vistaDataObj["symptoms"].length;
  vistaDataObj["symptoms"].forEach((one, index) => {
    g.$('GMRASYMP').$(index + 1).value = one.IEN + '^' + one.name;
  });

  g.$('GMRACHT').$(0).value = 1;
  g.$('GMRACHT').$(1).value = nowFM;
  g.$('GMRAOBHX').value = histObs;// === 'historical' ? 'h' : 'o';
  g.$('GMRACMTS').$(0).value = comment.length ? 1 : 0;
  if (comment.length) g.$('GMRACMTS').$(1).value = comment;

  if (histObs == 'o') {

  g.$('GMRASEVR').value = severity;
  }
 g.$('GMRATYPE').value="D"
 this.db.symbolTable.killVar('ORY');

 this.db.function({function: 'D^ewdVistAUtils', arguments: [`UPDATE^GMRAGUI1(${allIEN},${args.req.body.VistaServiceRequests.PatientId},$NA(^TMP("GMRA",$j)))`]});
 
 let vistaOutput = this.db.symbolTable.getVar('ORY');
 console.log('vista output ' + vistaOutput);
 if (+vistaOutput.$p(1) === -1) {
    result.error = vistaOutput.$p(2);
  }
 else {
    result.success = true;
    result.note = vistaOutput.$p(2); // if note was created, as it will need to be signed
  }
 finished(result);
}

 
 function getPatientAllergies(args, finished) {
  var patientid = args.req.headers.patientid;
  var duz = args.session.data.$('duz').value;
  var session = args.session;
  this.db.symbolTable.restore(session);
  this.db.symbolTable.setVar('DFN', patientid);
  this.db.symbolTable.killVar('GMRA');
  this.db.symbolTable.killVar('GMRAL');
  this.db.procedure({procedure: 'EN2^GMRADPT'});
  
  let adrs = [];
  let mainStatusOutput = this.db.symbolTable.getVar('GMRAL');
  let mainStatusHuman;
  if (mainStatusOutput === '') {
    mainStatusHuman = 'No Allergy Assessment';
    finished({
      status: mainStatusHuman,
      statusCode: 'NAA' 
    });
    return;
  }
  else if (+mainStatusOutput === 0) {
    mainStatusHuman = 'No Known Allergies';
    finished({
      status: mainStatusHuman,
      statusCode: 'NKA'
    });
    return;
  }
  else {
    // M for loop on a local
    for (let i = '""';;) {
      i = this.db.symbolTable.getVar(`$O(GMRAL(${i}))`);
      if (i === '') break;
      let datum = this.db.symbolTable.getVar(`GMRAL(${i})`);
      // piece 1 is the DFN
      let reactant =  datum.$p(2);
      // piece 3 is not used
      let verified =  this.db.function({function: 'EXTERNAL^DILFD',
        arguments: ['120.8', '19', '', datum.$p(4)]}).result;
      let isAllergy = +datum.$p(5) ? true : false;
      let allergyType = this.db.function({function: 'EXTERNAL^DILFD',
        arguments: ['120.8', '3.1', '', datum.$p(7)]}).result;
      let mechanism = datum.$p(8).$p(1,';');
      // Piece 9 is the pointer to the allergen
      let obsHist = datum.$p(10).$p(1,';');

      let signsSymptoms = [];
      for (let j = '""';;) {
        j = this.db.symbolTable.getVar(`$O(GMRAL(${i},"S",${j}))`);
        if (j === '') break;
        let datum = this.db.symbolTable.getVar(`GMRAL(${i},"S",${j})`);
        let reaction = datum.$p(1).$p(1,';');
        signsSymptoms.push(reaction);
      }

      let siteInfo = this.db.symbolTable.getVar(`$G(GMRAL(${i},"SITE"))`);
      let remoteSiteNameNStation = '';
      if (siteInfo) remoteSiteNameNStation = siteInfo.$p(2) + ' (' + siteInfo.$p(3).toString() + ') ';

      let adr = [];
      adr.push(i); //ien
      adr.push(reactant);
      adr.push(signsSymptoms);
      adr.push(allergyType);
      adr.push(verified);
      adr.push(mechanism);
      adr.push(obsHist);
      adr.push(remoteSiteNameNStation);
      adrs.push(adr);
    }
  }
  finished({
    status: `${adrs.length} ADRs present`,
    headers: [ 'Reactant', 'Signs and Symptoms', 'Allergy Type', 'Verified',
      'Mechanism', 'Observed/Historical',
      'Remote Allergy Source' ],
    data: adrs,
  });
 };

  function adrDetailsByIEN (args, finished) {
  var duz = args.session.data.$('duz').value;
  var session = args.session;
 
  this.db.symbolTable.restore(session);
  this.db.symbolTable.killVar('ORAY');
  this.db.function({function: 'D^ewdVistAUtils', arguments: [`DETAIL^ORQQAL(.ORAY,${duz},${args.req.headers.adrien})`]});

  let result = [];
  for (let i = 1; i !== ''; i = this.db.symbolTable.getVar(`$O(ORAY(${i}))`)) {
    result.push(this.db.symbolTable.getVar(`ORAY(${i})`));
  }
  finished(result);
 };



module.exports = {
  restModule: true,

  beforeHandler: function(req, session, send, finished) {
    if (req.path != '/api/authenticate') {
    return this.sessions.authenticateRestRequest(req, finished);
   }
  },
  afterHandler: function(args, session, send, finished) {
  },

  init: function(application) {

  this.documentStore = new DocumentStore(this.db);
 
    // Initialize session management
    sessions.addTo(this.documentStore);
 
  // Initialise Symbol Table
  this.db.symbolTable = sessions.symbolTable(this.db); 
 
  var worker = this;
  routes = [
      {
        url: '/api/authenticate',
        method: 'GET',
        handler: login
      },
      {
        url: '/api/getPatientInfo',
        method: 'GET',
        handler: getPatientDemo
      },
      {
        url: '/api/addAllergies',
        method: 'POST',
        handler: addAllergies
      },
      {
        url: '/api/getAllergies',
        method: 'GET',
        handler: getPatientAllergies
      },
      {
       url:'/api/getAllergyIEN',
       method: 'GET',
       handler: adrDetailsByIEN
     }
    ]
    routes = router.initialise(routes, module.exports);
    //router.setErrorResponse(404, 'Not Found');
    this.setCustomErrorResponse.call(this, {
      application: application,
      errorType: 'noTypeHandler',
      text: 'Resource Not Found',
      statusCode: '404'
    });
    }
  };
